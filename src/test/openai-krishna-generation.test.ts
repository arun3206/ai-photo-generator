import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPortraitTemplatesForRelationship,
  janmashtamiKrishnaMakhanTemplate,
} from "@/config/portrait-templates";
import {
  OpenAiGenerationService,
  OpenAiGenerationServiceError,
} from "@/server/generation/openai-generation-service";
import {
  OpenAiImageClient,
  OpenAiImageError,
  type OpenAiImageApi,
} from "@/server/generation/openai-image-client";
import type { AssetRecord } from "@/server/uploads/storage";
import { InMemoryStorage } from "@/server/uploads/storage";

class TestOpenAi implements OpenAiImageApi {
  readonly model = "gpt-image-2";
  generateKrishnaImage = vi.fn<OpenAiImageApi["generateKrishnaImage"]>(async () => ({
    bytes: new Uint8Array([8, 6, 7, 5, 3, 0, 9]),
    contentType: "image/png",
    model: this.model,
    requestId: "req_test_krishna",
  }));
}

const sessionId = "a6ef41b0-ac1e-48ca-a048-c09af0526ef1";

function childAsset(): AssetRecord {
  const assetId = crypto.randomUUID();
  return {
    assetId,
    sourceUploadId: assetId,
    sessionId,
    relationship: "janmashtami-child",
    role: "first",
    sanitizedPath: `uploads/${sessionId}/${assetId}.jpg`,
    validationStatus: "pass",
    width: 1000,
    height: 1400,
    expiresAt: Date.now() + 60_000,
  };
}

describe("OpenAI Janmashtami Krishna generation", () => {
  let storage: InMemoryStorage;
  let openAi: TestOpenAi;
  let child: AssetRecord;
  let service: OpenAiGenerationService;

  beforeEach(async () => {
    storage = new InMemoryStorage();
    await storage.deletePrivateObject(janmashtamiKrishnaMakhanTemplate.s3Key);
    openAi = new TestOpenAi();
    child = childAsset();
    await storage.saveSanitized(child, new Uint8Array([1, 2, 3, 4]));
    service = new OpenAiGenerationService({
      storage,
      openAi,
      readTemplate: async () => new Uint8Array([9, 9, 9]),
    });
  });

  function start(overrides: Partial<{ templateId: string; childAssetId: string }> = {}) {
    return service.start({
      requestId: crypto.randomUUID(),
      sessionId,
      templateId: overrides.templateId ?? janmashtamiKrishnaMakhanTemplate.id,
      childAssetId: overrides.childAssetId ?? child.assetId,
    });
  }

  it("returns the active Krishna template for the Janmashtami experience", () => {
    expect(getPortraitTemplatesForRelationship("janmashtami-child")).toMatchObject([
      {
        id: "janmashtami-krishna-makhan-001",
        name: "Makhan Chor Krishna",
        occasion: "JANMASHTAMI",
        category: "CHILD_KRISHNA",
        active: true,
      },
    ]);
  });

  it("rejects an unknown template", async () => {
    await expect(start({ templateId: "unknown-template" })).rejects.toMatchObject({
      code: "INVALID_TEMPLATE",
      message: "Unknown or inactive templateId.",
    });
    expect(openAi.generateKrishnaImage).not.toHaveBeenCalled();
  });

  it("rejects a missing child image", async () => {
    await expect(start({ childAssetId: crypto.randomUUID() })).rejects.toMatchObject({
      code: "INVALID_PHOTOS",
      message: "Please upload one valid child photo first.",
    });
    expect(openAi.generateKrishnaImage).not.toHaveBeenCalled();
  });

  it("calls OpenAI with the template first and child identity second", async () => {
    await start();
    expect(openAi.generateKrishnaImage).toHaveBeenCalledOnce();
    expect(openAi.generateKrishnaImage.mock.calls[0]?.[0]).toMatchObject({
      template: {
        bytes: new Uint8Array([9, 9, 9]),
        filename: "template.png",
        contentType: "image/png",
      },
      child: {
        bytes: new Uint8Array([1, 2, 3, 4]),
        contentType: "image/jpeg",
      },
      size: "1024x1536",
      quality: "medium",
    });
  });

  it("builds an identity-preserving, one-child prompt", async () => {
    await start();
    const prompt = openAi.generateKrishnaImage.mock.calls[0]?.[0].prompt ?? "";
    expect(prompt).toContain("Image A is the Krishna template");
    expect(prompt).toContain("Image B is the child identity reference");
    expect(prompt).toContain("Preserve the child's recognizable facial identity");
    expect(prompt).toContain("Show exactly one child only");
  });

  it("uploads the successful provider result to private output storage", async () => {
    const job = await start();
    expect(await storage.readPrivateObject(`outputs/${job.jobToken}/final.png`)).toEqual(
      new Uint8Array([8, 6, 7, 5, 3, 0, 9]),
    );
  });

  it("marks the job complete after storing the output", async () => {
    const job = await start();
    expect(job.status).toBe("complete");
    expect(await storage.getGenerationJob(job.jobToken)).toMatchObject({
      provider: "OPENAI",
      model: "gpt-image-2",
      occasion: "JANMASHTAMI",
      status: "complete",
      outputS3Key: `outputs/${job.jobToken}/final.png`,
    });
  });

  it("marks the job failed when OpenAI fails", async () => {
    openAi.generateKrishnaImage.mockRejectedValueOnce(
      new OpenAiImageError("Provider failed", 500, "provider"),
    );
    const requestId = crypto.randomUUID();
    await expect(
      service.start({
        requestId,
        sessionId,
        templateId: janmashtamiKrishnaMakhanTemplate.id,
        childAssetId: child.assetId,
      }),
    ).rejects.toBeInstanceOf(OpenAiGenerationServiceError);
    expect(await storage.getGenerationJob(requestId)).toMatchObject({
      status: "failed",
      errorMessage: "We couldn’t generate this portrait right now. Please try again.",
    });
  });

  it("returns a controlled configuration error when the API key is missing", async () => {
    service = new OpenAiGenerationService({
      storage,
      openAi: new OpenAiImageClient({ apiKey: "" }),
      readTemplate: async () => new Uint8Array([9, 9, 9]),
    });
    await expect(start()).rejects.toMatchObject({
      code: "PROVIDER_NOT_CONFIGURED",
      message: "OpenAI API key is not configured.",
    });
  });
});
