import { describe, expect, it, vi } from "vitest";
import type { RazorpayApi } from "@/server/payments/razorpay-client";
import { StorefrontPaymentService } from "@/server/storefront/payment-service";
import { verifyDownloadToken } from "@/server/storefront/download-token";

const keySecret = "razorpay_test_secret";
const downloadSecret = "download-test-secret-with-more-than-32-characters";

async function hmac(orderId: string, paymentId: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${orderId}|${paymentId}`),
    ),
  );
  return Array.from(digest, (value) => value.toString(16).padStart(2, "0")).join("");
}

function setup({
  productId = "14000-kids-worksheets",
  amount = 19_900,
}: { productId?: string; amount?: number } = {}) {
  const razorpay: RazorpayApi = {
    createOrder: vi.fn(async (input) => ({
      id: "order_storefront",
      amount: input.amount,
      currency: input.currency,
    })),
    fetchPayment: vi.fn(async () => ({
      id: "pay_storefront",
      orderId: "order_storefront",
      amount,
      currency: "INR",
      status: "captured",
      captured: true,
    })),
    fetchOrder: vi.fn(async () => ({
      id: "order_storefront",
      amount,
      currency: "INR",
      receipt: "ck_00000000-0000-4000-8000-000000000000",
      status: "paid",
      notes: { product_id: productId },
    })),
  };
  const service = new StorefrontPaymentService({
    razorpay,
    credentials: {
      keyId: "rzp_test_example",
      keySecret,
      mode: "TEST",
    },
    downloadTokenSecret: downloadSecret,
    now: () => Date.parse("2026-09-14T10:00:00Z"),
  });
  return { razorpay, service };
}

describe("storefront Razorpay flow", () => {
  it("creates an order using only the configured server price", async () => {
    const { razorpay, service } = setup();
    const order = await service.createOrder("14000-kids-worksheets");
    expect(order).toMatchObject({ amount: 19_900, currency: "INR" });
    expect(razorpay.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 19_900,
        currency: "INR",
        notes: expect.objectContaining({ product_id: "14000-kids-worksheets" }),
      }),
    );
  });

  it("creates the screen-free activity book order at the configured ₹197 price", async () => {
    const { razorpay, service } = setup({
      productId: "30-days-screen-free-activity-book",
      amount: 19_700,
    });
    const order = await service.createOrder("30-days-screen-free-activity-book");
    expect(order).toMatchObject({ amount: 19_700, currency: "INR" });
    expect(razorpay.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 19_700,
        currency: "INR",
        notes: expect.objectContaining({
          product_id: "30-days-screen-free-activity-book",
        }),
      }),
    );
  });

  it("verifies the captured payment and issues a valid download token", async () => {
    const { service } = setup();
    const result = await service.verify({
      productId: "14000-kids-worksheets",
      razorpayPaymentId: "pay_storefront",
      razorpayOrderId: "order_storefront",
      razorpaySignature: await hmac("order_storefront", "pay_storefront"),
    });
    expect(result.paid).toBe(true);
    await expect(
      verifyDownloadToken(result.downloadToken, {
        secret: downloadSecret,
        now: Date.parse("2026-09-14T10:00:01Z"),
      }),
    ).resolves.toMatchObject({ productId: "14000-kids-worksheets" });
  });

  it("rejects an invalid signature before unlocking a download", async () => {
    const { service } = setup();
    await expect(
      service.verify({
        productId: "14000-kids-worksheets",
        razorpayPaymentId: "pay_storefront",
        razorpayOrderId: "order_storefront",
        razorpaySignature: "0".repeat(64),
      }),
    ).rejects.toMatchObject({ code: "PAYMENT_VERIFICATION_FAILED" });
  });

  it("does not unlock a payment that Razorpay has not captured", async () => {
    const { razorpay, service } = setup();
    vi.spyOn(razorpay, "fetchPayment").mockResolvedValueOnce({
      id: "pay_storefront",
      orderId: "order_storefront",
      amount: 19_900,
      currency: "INR",
      status: "authorized",
      captured: false,
    });
    await expect(
      service.verify({
        productId: "14000-kids-worksheets",
        razorpayPaymentId: "pay_storefront",
        razorpayOrderId: "order_storefront",
        razorpaySignature: await hmac("order_storefront", "pay_storefront"),
      }),
    ).rejects.toMatchObject({ code: "PAYMENT_NOT_CAPTURED" });
  });

  it("reconfirms the captured payment before returning the delivery destination", async () => {
    const { service } = setup();
    const product = await service.confirmDownload({
      productId: "14000-kids-worksheets",
      orderId: "order_storefront",
      paymentId: "pay_storefront",
    });
    expect(product.file).toMatchObject({
      kind: "external_url",
      url: expect.stringContaining("drive.google.com/drive/folders/"),
    });
  });
});
