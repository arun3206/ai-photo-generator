import { describe, expect, it } from "vitest";
import {
  createDownloadToken,
  DOWNLOAD_ACCESS_LIFETIME_SECONDS,
  verifyDownloadToken,
} from "@/server/storefront/download-token";

const secret = "a-secure-test-secret-with-more-than-32-characters";
const now = Date.parse("2026-09-14T10:00:00Z");

describe("storefront download tokens", () => {
  it("keeps the default access link valid for 30 days", () => {
    expect(DOWNLOAD_ACCESS_LIFETIME_SECONDS).toBe(30 * 24 * 60 * 60);
  });

  it("round-trips a paid product authorization", async () => {
    const token = await createDownloadToken(
      {
        productId: "14000-kids-worksheets",
        orderId: "order_example",
        paymentId: "pay_example",
      },
      { secret, now, lifetimeSeconds: 60 },
    );
    await expect(
      verifyDownloadToken(token, { secret, now: now + 30_000 }),
    ).resolves.toMatchObject({
      productId: "14000-kids-worksheets",
      orderId: "order_example",
      paymentId: "pay_example",
    });
  });

  it("rejects tampering and expiry", async () => {
    const token = await createDownloadToken(
      {
        productId: "14000-kids-worksheets",
        orderId: "order_example",
        paymentId: "pay_example",
      },
      { secret, now, lifetimeSeconds: 60 },
    );
    await expect(
      verifyDownloadToken(`${token.slice(0, -1)}x`, {
        secret,
        now: now + 1_000,
      }),
    ).resolves.toBeNull();
    await expect(
      verifyDownloadToken(token, { secret, now: now + 60_001 }),
    ).resolves.toBeNull();
  });
});
