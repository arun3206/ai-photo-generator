import {
  createStorefrontOrderSchema,
  storefrontError,
} from "@/server/storefront/contracts";
import {
  StorefrontPaymentError,
  StorefrontPaymentService,
} from "@/server/storefront/payment-service";
import { getAnonymousSession, isSameOrigin } from "@/server/security/anonymous-session";
import { getRateLimiter } from "@/server/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return storefrontError("FORBIDDEN", "This request could not be verified.", 403);
  try {
    const sessionId = await getAnonymousSession();
    if (!(await getRateLimiter().take(sessionId, "storefrontCheckout")))
      return storefrontError(
        "RATE_LIMITED",
        "Too many checkout attempts. Please wait a minute and try again.",
        429,
      );
    const parsed = createStorefrontOrderSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return storefrontError("BAD_REQUEST", "The product selection was invalid.", 400);
    const order = await new StorefrontPaymentService().createOrder(parsed.data.productId);
    return Response.json(
      { ok: true, data: order },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof StorefrontPaymentError)
      return storefrontError(error.code, error.message, error.httpStatus);
    return storefrontError(
      "PAYMENT_UNAVAILABLE",
      "Secure payment is temporarily unavailable. Please try again.",
      503,
    );
  }
}
