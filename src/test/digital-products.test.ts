import { describe, expect, it } from "vitest";
import {
  digitalProductDiscount,
  getDigitalProductById,
  getDigitalProductBySlug,
} from "@/config/digital-products";

describe("digital product configuration", () => {
  it("uses one definition for catalogue, checkout, and private delivery", () => {
    const product = getDigitalProductById("14000-kids-worksheets");
    expect(product).not.toBeNull();
    if (!product) throw new Error("Expected worksheets product configuration");
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

  it("configures the screen-free activity book as a protected ₹197 delivery", () => {
    const product = getDigitalProductById("30-days-screen-free-activity-book");
    expect(product).toMatchObject({
      slug: "30-days-screen-free-activity-book",
      priceMinor: 19_700,
      originalPriceMinor: 19_700,
      currency: "INR",
      thumbnail: "/products/30-days-screen-free-activity-book/bundle.png",
      file: {
        kind: "external_url",
        type: "folder",
        url: "https://drive.google.com/drive/folders/1HL4O7LDMDOiV3_tlBgoYrznhmzN56x-1?usp=drive_link",
      },
    });
    expect(product?.previewImages).toHaveLength(10);
    expect(digitalProductDiscount(product!)).toBe(0);
  });

  it("does not resolve an unknown product", () => {
    expect(getDigitalProductById("unknown")).toBeNull();
    expect(getDigitalProductBySlug("unknown")).toBeNull();
  });

  it("configures the SSC notes bundle with trusted pricing and delivery", () => {
    const product = getDigitalProductById("ssc-complete-notes-bundle");
    expect(product).toMatchObject({
      slug: "ssc-complete-notes-bundle",
      priceMinor: 19_800,
      currency: "INR",
      file: {
        kind: "external_url",
        type: "folder",
        url: expect.stringContaining("1UTuN2Kci07Ua8WVTzWF7HqIft7FCjYHn"),
      },
    });
    expect(product?.previewImages).toHaveLength(6);
  });
});
