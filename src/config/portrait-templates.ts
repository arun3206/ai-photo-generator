import type { PortraitTemplate, Relationship } from "@/features/portrait-flow/types";

interface BasePortraitTemplateConfiguration {
  id: PortraitTemplate;
  name: string;
  relationshipId: Relationship;
  imageUrl: string;
  active: boolean;
  description: string;
  sortOrder: number;
  masterFilePath: string;
  contentType: "image/png";
  s3Key: string;
}

export interface MagicHourPortraitTemplateConfiguration extends BasePortraitTemplateConfiguration {
  provider: "MAGIC_HOUR";
  relationship: "BROTHER_SISTER";
  occasion: "RAKSHA_BANDHAN";
  category: "FAMILY_RAKHI";
  faceMappingS3Key: string;
  referenceFaces: {
    brother: PortraitTemplateReferenceFace;
    sister: PortraitTemplateReferenceFace;
  };
}

export interface OpenAiPortraitTemplateConfiguration extends BasePortraitTemplateConfiguration {
  provider: "OPENAI";
  relationship: "CHILD";
  occasion: "JANMASHTAMI";
  category: "CHILD_KRISHNA";
  outputSize: "1024x1536";
  outputQuality: "medium";
  promptInstructions: readonly string[];
}

export type PortraitTemplateConfiguration =
  MagicHourPortraitTemplateConfiguration | OpenAiPortraitTemplateConfiguration;

export interface PortraitTemplateReferenceFace {
  masterFilePath: string;
  contentType: "image/png";
  s3Key: string;
}

export const rakhiBrotherSisterTemplate = {
  id: "rakhi-brother-sister-traditional-001",
  name: "Traditional Rakhi Celebration",
  relationship: "BROTHER_SISTER",
  relationshipId: "brother-sister",
  occasion: "RAKSHA_BANDHAN",
  category: "FAMILY_RAKHI",
  provider: "MAGIC_HOUR",
  imageUrl: "/api/templates/rakhi-brother-sister-traditional-001/preview",
  active: true,
  description: "A traditional Raksha Bandhan portrait for a brother and sister.",
  sortOrder: 2,
  masterFilePath: "templates/brother-sister/brother-sister101.png",
  contentType: "image/png",
  s3Key: "templates/raksha-bandhan/rakhi-brother-sister-traditional-001/template.png",
  faceMappingS3Key:
    "templates/raksha-bandhan/rakhi-brother-sister-traditional-001/face-mapping.json",
  referenceFaces: {
    brother: {
      masterFilePath: "templates/brother-sister/bother-face.png",
      contentType: "image/png",
      s3Key:
        "templates/raksha-bandhan/rakhi-brother-sister-traditional-001/reference-faces/brother.png",
    },
    sister: {
      masterFilePath: "templates/brother-sister/sister-face.png",
      contentType: "image/png",
      s3Key:
        "templates/raksha-bandhan/rakhi-brother-sister-traditional-001/reference-faces/sister.png",
    },
  },
} as const satisfies PortraitTemplateConfiguration;

export const janmashtamiKrishnaMakhanTemplate = {
  id: "janmashtami-krishna-makhan-001",
  name: "Makhan Chor Krishna",
  relationship: "CHILD",
  relationshipId: "janmashtami-child",
  occasion: "JANMASHTAMI",
  category: "CHILD_KRISHNA",
  provider: "OPENAI",
  imageUrl: "/api/templates/janmashtami-krishna-makhan-001/preview",
  active: true,
  description:
    "A warm, photorealistic Little Krishna portrait with makhan matki and flute.",
  sortOrder: 1,
  masterFilePath: "templates/janmashtami/janmashtami-krishna-makhan-001/template.png",
  contentType: "image/png",
  s3Key: "templates/janmashtami/janmashtami-krishna-makhan-001/template.png",
  outputSize: "1024x1536",
  outputQuality: "medium",
  promptInstructions: [
    "Image A is the Krishna template and composition/style reference.",
    "Image B is the child identity reference.",
    "Create a highly photorealistic Janmashtami portrait of the same child shown in Image B.",
    "Preserve the child's recognizable facial identity: face shape, eyes, eyebrows, nose, lips, cheeks, forehead, skin tone, age appearance, and distinctive facial characteristics.",
    "Do not create a different child. Highest priority: the result must be immediately recognizable as the child from Image B.",
    "Follow Image A for composition, warm festive mood, costume direction, lighting, and premium visual finish.",
    "Dress the child as Little Krishna or Bal Krishna with a yellow silk dhoti, tasteful jewellery, and a peacock-feather crown.",
    "Include a makhan matki and a flute in a refined Indian Janmashtami setting.",
    "Show exactly one child only. Do not add any other people.",
    "No text, watermark, logo, cartoon styling, blue-painted skin, distorted anatomy, or extra limbs.",
  ],
} as const satisfies PortraitTemplateConfiguration;

export const portraitTemplates: readonly PortraitTemplateConfiguration[] = [
  janmashtamiKrishnaMakhanTemplate,
  rakhiBrotherSisterTemplate,
];

export function getActivePortraitTemplate(
  templateId: string,
): PortraitTemplateConfiguration | null {
  return (
    portraitTemplates.find((template) => template.id === templateId && template.active) ??
    null
  );
}

export function getPortraitTemplatesForRelationship(
  relationship: Relationship | null,
): readonly PortraitTemplateConfiguration[] {
  if (!relationship) return [];
  return portraitTemplates
    .filter((template) => template.active && template.relationshipId === relationship)
    .sort((first, second) => first.sortOrder - second.sortOrder);
}
