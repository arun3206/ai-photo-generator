import { z } from "zod";

export const relationshipSchema = z.enum([
  "janmashtami-child",
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
  "rakhi-brother-sister-traditional-001",
]);
