import path from "node:path";
import {
  getActivePortraitTemplate,
  type OpenAiPortraitTemplateConfiguration,
} from "@/config/portrait-templates";
import { buildKrishnaPrompt } from "@/server/generation/krishna-prompt";
import {
  OpenAiImageClient,
  OpenAiImageError,
  type OpenAiImageApi,
} from "@/server/generation/openai-image-client";
import type { GenerationJobRecord, PublicGenerationJob } from "@/server/generation/types";
import type { GenerationApiErrorCode } from "@/server/generation/contracts";
import { readTemplateAsset } from "@/server/generation/template-assets";
import {
  getPrivateImageStorage,
  type AssetRecord,
  type PrivateImageStorageProvider,
} from "@/server/uploads/storage";

const GENERATION_RETENTION_MS = 7 * 24 * 60 * 60 * 1_000;

export class OpenAiGenerationServiceError extends Error {
  constructor(
    readonly code: GenerationApiErrorCode,
    message: string,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = "OpenAiGenerationServiceError";
  }
}

export interface StartOpenAiGenerationInput {
  requestId: string;
  sessionId: string;
  templateId: string;
  childAssetId: string;
}

interface OpenAiGenerationServiceDependencies {
  storage?: PrivateImageStorageProvider;
  openAi?: OpenAiImageApi;
  readTemplate?: (relativePath: string) => Promise<Uint8Array>;
  now?: () => number;
}

function safeLog(event: string, details: Record<string, unknown>) {
  console.info(JSON.stringify({ scope: "openai-krishna-generation", event, ...details }));
}

function toPublicJob(job: GenerationJobRecord): PublicGenerationJob {
  return {
    jobToken: job.jobToken,
    templateId: job.templateId,
    status: job.status,
    errorMessage: job.errorMessage,
    outputUrl:
      job.status === "complete" ? `/api/generations/${job.jobToken}/output` : undefined,
  };
}

function providerFailure(error: unknown) {
  if (error instanceof OpenAiGenerationServiceError) return error;
  if (error instanceof OpenAiImageError) {
    if (error.category === "not-configured")
      return new OpenAiGenerationServiceError(
        "PROVIDER_NOT_CONFIGURED",
        "OpenAI API key is not configured.",
        503,
      );
    if (error.category === "authentication")
      return new OpenAiGenerationServiceError(
        "PROVIDER_AUTHENTICATION_FAILED",
        "The portrait service is not configured correctly. Please contact support.",
        503,
      );
    return new OpenAiGenerationServiceError(
      "PROVIDER_FAILED",
      error.category === "rate-limit"
        ? "Portrait generation is busy right now. Please try again shortly."
        : "We couldn’t generate this portrait right now. Please try again.",
      error.category === "rate-limit" ? 429 : 502,
    );
  }
  return new OpenAiGenerationServiceError(
    "STORAGE_UNAVAILABLE",
    "Portrait storage is temporarily unavailable. Please try again.",
    503,
  );
}

function imageContentType(pathname: string) {
  if (pathname.toLowerCase().endsWith(".png")) return "image/png" as const;
  if (pathname.toLowerCase().endsWith(".webp")) return "image/webp" as const;
  return "image/jpeg" as const;
}

export class OpenAiGenerationService {
  private readonly storage: PrivateImageStorageProvider;
  private readonly openAi: OpenAiImageApi;
  private readonly readTemplate: (relativePath: string) => Promise<Uint8Array>;
  private readonly now: () => number;

  constructor(dependencies: OpenAiGenerationServiceDependencies = {}) {
    this.storage = dependencies.storage ?? getPrivateImageStorage();
    this.openAi = dependencies.openAi ?? new OpenAiImageClient();
    this.readTemplate = dependencies.readTemplate ?? readTemplateAsset;
    this.now = dependencies.now ?? Date.now;
  }

  async start(input: StartOpenAiGenerationInput): Promise<PublicGenerationJob> {
    const startedAt = this.now();
    const template = getActivePortraitTemplate(input.templateId);
    if (!template || template.provider !== "OPENAI")
      throw new OpenAiGenerationServiceError(
        "INVALID_TEMPLATE",
        "Unknown or inactive templateId.",
        400,
      );

    const child = await this.storage.getAsset(input.childAssetId).catch(() => {
      throw new OpenAiGenerationServiceError(
        "STORAGE_UNAVAILABLE",
        "The uploaded child photo could not be loaded. Please try again.",
        503,
      );
    });
    this.validateChildAsset(child, input.sessionId, template);

    const job: GenerationJobRecord = {
      jobId: input.requestId,
      jobToken: input.requestId,
      sessionId: input.sessionId,
      templateId: template.id,
      occasion: template.occasion,
      provider: template.provider,
      model: this.openAi.model,
      childAssetId: input.childAssetId,
      status: "initializing",
      createdAt: startedAt,
      updatedAt: startedAt,
      expiresAt: startedAt + GENERATION_RETENTION_MS,
    };
    const created = await this.storage.createGenerationJob(job);
    if (!created) {
      const existing = await this.storage.getGenerationJob(job.jobId);
      if (
        existing?.sessionId === input.sessionId &&
        existing.templateId === template.id &&
        existing.childAssetId === input.childAssetId
      )
        return toPublicJob(existing);
      throw new OpenAiGenerationServiceError(
        "FORBIDDEN",
        "This generation request could not be verified.",
        403,
      );
    }

    try {
      const templateUploaded = await this.ensureTemplate(template);
      const [templateBytes, childBytes] = await Promise.all([
        this.storage.readPrivateObject(template.s3Key),
        this.storage.readSanitizedAsset(child!),
      ]);
      if (!templateBytes)
        throw new OpenAiGenerationServiceError(
          "STORAGE_UNAVAILABLE",
          "The selected Krishna template is unavailable.",
          503,
        );

      const processing: GenerationJobRecord = {
        ...job,
        status: "rendering",
        updatedAt: this.now(),
      };
      await this.storage.saveGenerationJob(processing);
      safeLog("generation_started", {
        jobId: job.jobId,
        templateId: template.id,
        provider: template.provider,
        model: this.openAi.model,
        childUploadKey: child!.sanitizedPath,
        templateS3Key: template.s3Key,
        templateAssetUploaded: templateUploaded,
      });

      const result = await this.openAi.generateKrishnaImage({
        prompt: buildKrishnaPrompt(template),
        template: {
          bytes: templateBytes,
          filename: "template.png",
          contentType: template.contentType,
        },
        child: {
          bytes: childBytes,
          filename: path.basename(child!.sanitizedPath) || "child.jpg",
          contentType: imageContentType(child!.sanitizedPath),
        },
        size: template.outputSize,
        quality: template.outputQuality,
      });
      const outputS3Key = `outputs/${job.jobId}/final.png`;
      await this.storage.putPrivateObject(outputS3Key, result.bytes, result.contentType);
      const completedAt = this.now();
      const complete: GenerationJobRecord = {
        ...processing,
        status: "complete",
        model: result.model,
        outputS3Key,
        outputContentType: result.contentType,
        completedAt,
        updatedAt: completedAt,
      };
      await this.storage.saveGenerationJob(complete);
      safeLog("generation_completed", {
        jobId: job.jobId,
        templateId: template.id,
        provider: template.provider,
        model: result.model,
        openAiRequestId: result.requestId,
        outputS3Key,
        durationMs: completedAt - startedAt,
      });
      return toPublicJob(complete);
    } catch (error) {
      const failure = providerFailure(error);
      await this.storage
        .saveGenerationJob({
          ...job,
          status: "failed",
          errorMessage: failure.message,
          updatedAt: this.now(),
        })
        .catch(() => undefined);
      safeLog("generation_failed", {
        jobId: job.jobId,
        templateId: template.id,
        provider: template.provider,
        model: this.openAi.model,
        errorCategory: error instanceof OpenAiImageError ? error.category : failure.code,
        durationMs: this.now() - startedAt,
      });
      throw failure;
    }
  }

  private validateChildAsset(
    asset: AssetRecord | null,
    sessionId: string,
    template: OpenAiPortraitTemplateConfiguration,
  ): asserts asset is AssetRecord {
    if (
      !asset ||
      asset.sessionId !== sessionId ||
      asset.role !== "first" ||
      asset.relationship !== template.relationshipId
    )
      throw new OpenAiGenerationServiceError(
        "INVALID_PHOTOS",
        "Please upload one valid child photo first.",
        400,
      );
  }

  private async ensureTemplate(template: OpenAiPortraitTemplateConfiguration) {
    if (await this.storage.privateObjectExists(template.s3Key)) return false;
    const bytes = await this.readTemplate(template.masterFilePath).catch(() => {
      throw new OpenAiGenerationServiceError(
        "STORAGE_UNAVAILABLE",
        "The selected Krishna template could not be loaded.",
        503,
      );
    });
    return this.storage.putPrivateObject(template.s3Key, bytes, template.contentType, {
      ifAbsent: true,
    });
  }
}
