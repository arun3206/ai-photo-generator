import {
  storefrontError,
  verifyStorefrontPaymentSchema,
} from "@/server/storefront/contracts";
import {
  StorefrontPaymentError,
  StorefrontPaymentService,
} from "@/server/storefront/payment-service";
import { isSameOrigin } from "@/server/security/anonymous-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return storefrontError("FORBIDDEN", "This request could not be verified.", 403);
  const parsed = verifyStorefrontPaymentSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return storefrontError("BAD_REQUEST", "The payment details were invalid.", 400);
  try {
    const result = await new StorefrontPaymentService().verify(parsed.data);
    return Response.json(
      { ok: true, data: result },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof StorefrontPaymentError)
      return storefrontError(error.code, error.message, error.httpStatus);
    return storefrontError(
      "PAYMENT_UNAVAILABLE",
      "Payment verification is temporarily unavailable. Please try again.",
      503,
    );
  }
}
