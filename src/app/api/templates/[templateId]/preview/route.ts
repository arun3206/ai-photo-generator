import { getActivePortraitTemplate } from "@/config/portrait-templates";
import { readTemplateAsset } from "@/server/generation/template-assets";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await context.params;
  const template = getActivePortraitTemplate(templateId);
  if (!template) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readTemplateAsset(template.masterFilePath);
    return new Response(bytes, {
      headers: {
        "Content-Type": template.contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Template preview unavailable", { status: 503 });
  }
}
