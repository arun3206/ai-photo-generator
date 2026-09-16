import type { MetadataRoute } from "next";
import { getActiveDigitalProducts } from "@/config/digital-products";

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://cherishkit.com"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    {
      path: "/ai-photo-generator",
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/delivery-policy", priority: 0.2, changeFrequency: "yearly" as const },
  ];
  const products = getActiveDigitalProducts().map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticPages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...products,
  ];
}
