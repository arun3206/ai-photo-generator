import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import {
  getSelectablePortraitTemplateSections,
  retroPortraitTemplates,
} from "@/config/portrait-templates";
import { retroPromptKeys } from "@/config/retro-templates";
import { getRetroPrompt } from "@/server/generation/retro-prompts";
import { OpenAiGenerationService } from "@/server/generation/openai-generation-service";
import type { OpenAiImageApi } from "@/server/generation/openai-image-client";
import type { AssetRecord } from "@/server/uploads/storage";
import { InMemoryStorage } from "@/server/uploads/storage";

const expectedSequence = [
  "retro-girl-template-001",
  "retro-single-boy-001",
  "retro-couple-scooter-001",
  "retro-girl-car-001",
  "retro-couple-bullet-001",
  "retro-video-rental-001",
  "retro-girl-camera-001",
  "retro-boy-car-001",
] as const;

class TestOpenAi implements OpenAiImageApi {
  readonly model = "gpt-image-2";
  generateKrishnaImage = vi.fn<OpenAiImageApi["generateKrishnaImage"]>(async () => ({
    bytes: new Uint8Array([8, 0, 8, 0]),
    contentType: "image/png",
    model: this.model,
    requestId: "req_retro_test",
  }));
}

function asset(relationship: "retro-single" | "retro-couple", role: "first" | "second") {
  const assetId = crypto.randomUUID();
  return {
    assetId,
    sourceUploadId: assetId,
    sessionId: "f5b9f607-4027-48f7-92ed-708ff8557427",
    relationship,
    role,
    sanitizedPath: `uploads/retro/${assetId}.jpg`,
    validationStatus: "pass",
    width: 1000,
    height: 1400,
    expiresAt: Date.now() + 60_000,
  } satisfies AssetRecord;
}

describe("Retro templates", () => {
  let storage: InMemoryStorage;
  let openAi: TestOpenAi;
  let readTemplate: Mock<(relativePath: string) => Promise<Uint8Array>>;
  let service: OpenAiGenerationService;

  beforeEach(() => {
    storage = new InMemoryStorage();
    openAi = new TestOpenAi();
    readTemplate = vi.fn(async () => new Uint8Array([9, 9, 9]));
    service = new OpenAiGenerationService({ storage, openAi, readTemplate });
  });

  it("places all eight templates first under the Trending section in mapped order", () => {
    const sections = getSelectablePortraitTemplateSections();
    expect(sections[0]?.title).toBe("🔥 Trending");
    expect(sections[0]?.templates.map((template) => template.id)).toEqual(
      expectedSequence,
    );
    expect(retroPortraitTemplates.map((template) => template.promptKey)).toEqual(
      retroPromptKeys,
    );
  });

  it("has a deployable WebP preview for every Retro template", () => {
    for (const template of retroPortraitTemplates) {
      expect(template.previewImage).toMatch(/^\/templates\/retro-.+-v1\.webp$/);
      expect(
        fs.existsSync(path.join(process.cwd(), "public", template.previewImage)),
      ).toBe(true);
      expect(template.generationInputMode).toBe("IDENTITIES_ONLY");
      expect(template.masterFilePath).toBeUndefined();
      expect(template.s3Key).toBeUndefined();
    }
  });

  it("keeps the eight server prompts identical to the updated mapping file", () => {
    const mapping = fs.readFileSync(
      path.join(process.cwd(), "templates", "retro", "prompt-mapping.txt"),
      "utf8",
    );
    const matches = [
      ...mapping.matchAll(
        /^\s*(\d+)\.\s*([^\r\n]+)\s*\r?\n([\s\S]*?)(?=^\s*\d+\.\s*[^\r\n]+\s*\r?\n|(?![\s\S]))/gm,
      ),
    ];
    expect(matches).toHaveLength(8);
    expect(matches.map((match) => match[3]!.trim().replace(/\r\n/g, "\n"))).toEqual(
      retroPromptKeys.map(getRetroPrompt),
    );
  });

  it.each(
    retroPortraitTemplates.filter((template) => template.identityMode === "RETRO_SINGLE"),
  )(
    "generates $name from only the uploaded subject and mapped prompt",
    async (template) => {
      const subject = asset("retro-single", "first");
      await storage.saveSanitized(subject, new Uint8Array([1, 2, 3]));
      await service.start({
        requestId: crypto.randomUUID(),
        sessionId: subject.sessionId,
        templateId: template.id,
        subjectAssetId: subject.assetId,
      });

      const input = openAi.generateKrishnaImage.mock.calls[0]?.[0];
      expect(input?.template).toBeUndefined();
      expect(input?.identityImages).toEqual([
        expect.objectContaining({
          bytes: new Uint8Array([1, 2, 3]),
          filename: "subject-identity.jpg",
        }),
      ]);
      expect(input?.prompt).toBe(getRetroPrompt(template.promptKey!));
      expect(readTemplate).not.toHaveBeenCalled();
    },
  );

  it.each(
    retroPortraitTemplates.filter((template) => template.identityMode === "RETRO_COUPLE"),
  )(
    "generates $name from male then female uploads without the preview",
    async (template) => {
      const male = asset("retro-couple", "first");
      const female = asset("retro-couple", "second");
      await storage.saveSanitized(male, new Uint8Array([4, 5, 6]));
      await storage.saveSanitized(female, new Uint8Array([7, 8, 9]));
      const job = await service.start({
        requestId: crypto.randomUUID(),
        sessionId: male.sessionId,
        templateId: template.id,
        maleAssetId: male.assetId,
        femaleAssetId: female.assetId,
      });

      const input = openAi.generateKrishnaImage.mock.calls[0]?.[0];
      expect(input?.template).toBeUndefined();
      expect(input?.identityImages).toEqual([
        expect.objectContaining({
          bytes: new Uint8Array([4, 5, 6]),
          filename: "male-identity.jpg",
        }),
        expect.objectContaining({
          bytes: new Uint8Array([7, 8, 9]),
          filename: "female-identity.jpg",
        }),
      ]);
      expect(input?.prompt).toBe(getRetroPrompt(template.promptKey!));
      expect(readTemplate).not.toHaveBeenCalled();
      expect(await storage.getGenerationJob(job.jobToken)).toMatchObject({
        maleAssetId: male.assetId,
        femaleAssetId: female.assetId,
      });
    },
  );
});
