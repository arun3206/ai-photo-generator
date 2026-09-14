import { describe, expect, it } from "vitest";
import {
  digitalProductDiscount,
  digitalProducts,
  getDigitalProductById,
  getDigitalProductBySlug,
} from "@/config/digital-products";

describe("digital product configuration", () => {
  it("uses one definition for catalogue, checkout, and private delivery", () => {
    const product = digitalProducts[0];
    expect(getDigitalProductById(product.id)).toBe(product);
    expect(getDigitalProductBySlug(product.slug)).toBe(product);
    expect(product.priceMinor).toBe(19_900);
    expect(product.file).toMatchObject({
      kind: "external_url",
      type: "folder",
      url: expect.stringContaining("drive.google.com/drive/folders/"),
    });
    expect(digitalProductDiscount(product)).toBe(90);
    expect(product.previewImages).toHaveLength(9);
    expect(new Set(product.previewImages.map((preview) => preview.src)).size).toBe(9);
  });

  it("does not resolve an unknown product", () => {
    expect(getDigitalProductById("unknown")).toBeNull();
    expect(getDigitalProductBySlug("unknown")).toBeNull();
  });
});
