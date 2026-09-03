import type { OpenAiPortraitTemplateConfiguration } from "@/config/portrait-templates";

export function buildKrishnaPrompt(template: OpenAiPortraitTemplateConfiguration) {
  const isCouple = template.identityMode === "COUPLE";
  const isCombinedMotherDaughter = template.identityMode === "MOTHER_DAUGHTER_COMBINED";
  return [
    `Use the ${isCouple ? "three" : "two"} input images according to their assigned roles below.`,
    ...template.promptInstructions,
    isCouple
      ? "Preserve both supplied adult faces as two separate, recognizable identities in the final portrait."
      : isCombinedMotherDaughter
        ? "Preserve the mother and daughter from the combined identity photograph as two separate, recognizable identities in the final portrait."
        : "Keep the child's face naturally integrated with consistent perspective, lighting, skin texture, and age-appropriate proportions.",
    "Return one finished portrait image only.",
  ].join("\n");
}
