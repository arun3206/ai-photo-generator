import {
  openRazorpayCheckout,
  type RazorpaySuccess,
} from "@/features/portrait-flow/payment-client";

export interface StorefrontOrder {
  productId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: "INR" | "USD";
  displayAmount: string;
}

async function responseData<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    "ok" in body &&
    body.ok === true &&
    "data" in body
  )
    return body.data as T;
  const message =
    body &&
    typeof body === "object" &&
    "error" in body &&
    body.error &&
    typeof body.error === "object" &&
    "message" in body.error &&
    typeof body.error.message === "string"
      ? body.error.message
      : "Payment is temporarily unavailable.";
  throw new Error(message);
}

export async function purchaseDigitalProduct(product: { id: string; name: string }) {
  const order = await fetch("/api/storefront/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: product.id }),
  }).then((response) => responseData<StorefrontOrder>(response));
  const checkoutResult = await openRazorpayCheckout(order, undefined, {
    name: "CherishKit",
    description: product.name,
  });
  const verification = await fetch("/api/storefront/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: product.id,
      razorpayPaymentId: checkoutResult.razorpay_payment_id,
      razorpayOrderId: checkoutResult.razorpay_order_id,
      razorpaySignature: checkoutResult.razorpay_signature,
    }),
  }).then((response) => responseData<{ paid: true; downloadToken: string }>(response));
  return { order, checkoutResult, ...verification };
}

export type { RazorpaySuccess };
