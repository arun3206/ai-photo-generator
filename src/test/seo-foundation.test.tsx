import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AiPhotoGeneratorPage, {
  metadata as aiPhotoGeneratorMetadata,
} from "@/app/ai-photo-generator/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { metadata as createMetadata } from "@/app/create/layout";
import { metadata as resultMetadata } from "@/app/result/[jobToken]/layout";

describe("technical SEO foundation", () => {
  it("publishes an indexable AI photo generator landing page", () => {
    render(<AiPhotoGeneratorPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "AI Photo Generator for Indian Retro Portraits",
      }),
    ).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /Create Your AI Portrait/ })[0],
    ).toHaveAttribute("href", "/create");
    expect(
      screen.getByRole("heading", { name: "Retro AI portrait styles" }),
    ).toBeVisible();
    expect(aiPhotoGeneratorMetadata.alternates).toEqual({
      canonical: "/ai-photo-generator",
    });
  });

  it("keeps private workflow pages out of search results", () => {
    expect(createMetadata.robots).toEqual({ index: false, follow: false });
    expect(resultMetadata.robots).toEqual({ index: false, follow: false });
  });

  it("lists public pages and excludes transactional routes from the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://cherishkit.com/ai-photo-generator");
    expect(urls).toContain("https://cherishkit.com/product/14000-kids-worksheets");
    expect(urls.some((url) => url.includes("/create"))).toBe(false);
    expect(urls.some((url) => url.includes("/result"))).toBe(false);
  });

  it("points crawlers to the sitemap and blocks private service routes", () => {
    expect(robots()).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/download/", "/result/"],
      },
      sitemap: "https://cherishkit.com/sitemap.xml",
    });
  });
});
