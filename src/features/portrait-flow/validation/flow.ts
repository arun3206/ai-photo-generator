import { z } from "zod";

export const relationshipSchema = z.enum([
  "janmashtami-child",
  "radha-krishna-couple",
  "mother-child",
  "father-child",
  "grandparent-grandchild",
  "brother-sister",
]);

export const occasionSchema = z.enum([
  "just-because",
  "birthday",
  "janmashtami",
  "raksha-bandhan",
  "diwali",
  "wedding-blessings",
]);

export const portraitTemplateSchema = z.enum([
  "janmashtami-krishna-makhan-001",
  "janmashtami-radha-krishna-couple-001",
  "janmashtami-little-krishna-001",
  "janmashtami-wish-flute-001",
  "janmashtami-wish-portrait-001",
  "janmashtami-mother-daughter-radha-001",
  "rakhi-brother-sister-traditional-001",
]);
