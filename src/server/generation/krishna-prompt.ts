import type { OpenAiPortraitTemplateConfiguration } from "@/config/portrait-templates";

export function buildKrishnaPrompt(template: OpenAiPortraitTemplateConfiguration) {
  return [
    "Use the two input images according to their assigned roles below.",
    ...template.promptInstructions,
    "Keep the child's face naturally integrated with consistent perspective, lighting, skin texture, and age-appropriate proportions.",
    "Return one finished portrait image only.",
  ].join("\n");
}
