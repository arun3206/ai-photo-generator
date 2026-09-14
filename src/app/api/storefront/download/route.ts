import { getAnonymousSession } from "@/server/security/anonymous-session";
import { getRateLimiter } from "@/server/security/rate-limit";
import { verifyDownloadToken } from "@/server/storefront/download-token";
import {
  StorefrontPaymentError,
  StorefrontPaymentService,
} from "@/server/storefront/payment-service";
import { getPrivateImageStorage } from "@/server/uploads/storage";

export const runtime = "nodejs";

function plain(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  try {
    const sessionId = await getAnonymousSession();
    if (!(await getRateLimiter().take(sessionId, "storefrontDownload")))
      return plain(
        "Too many download attempts. Please wait a minute and try again.",
        429,
      );
    const token = new URL(request.url).searchParams.get("token");
    if (!token || token.length > 2_500)
      return plain("This download link is invalid.", 400);
    const authorization = await verifyDownloadToken(token);
    if (!authorization) return plain("This download link is invalid or expired.", 403);
    const product = await new StorefrontPaymentService().confirmDownload({
      productId: authorization.productId,
      orderId: authorization.orderId,
      paymentId: authorization.paymentId,
    });
    if (product.file.kind === "external_url") {
      const destination = new URL(product.file.url);
      if (destination.protocol !== "https:")
        return plain("Your download destination is temporarily unavailable.", 503);
      return new Response(null, {
        status: 302,
        headers: {
          Location: destination.href,
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    const bytes = await getPrivateImageStorage().readPrivateObject(product.file.key);
    if (!bytes)
      return plain(
        "Your payment is confirmed, but this file is temporarily unavailable. Please contact support with your payment reference.",
        503,
      );
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new Response(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": product.file.contentType,
        "Content-Disposition": `attachment; filename="${product.file.downloadName}"`,
        "Content-Length": String(bytes.byteLength),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof StorefrontPaymentError)
      return plain(error.message, error.httpStatus);
    return plain("Your download is temporarily unavailable. Please try again.", 503);
  }
}
