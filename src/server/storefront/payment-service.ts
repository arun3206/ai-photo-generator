import {
  formatDigitalProductPrice,
  getDigitalProductById,
  type DigitalProduct,
} from "@/config/digital-products";
import { RazorpayClient, type RazorpayApi } from "@/server/payments/razorpay-client";
import {
  resolveRazorpayCredentials,
  type RazorpayCredentials,
} from "@/server/payments/razorpay-credentials";
import { createDownloadToken } from "@/server/storefront/download-token";

export class StorefrontPaymentError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = "StorefrontPaymentError";
  }
}

interface Dependencies {
  razorpay?: RazorpayApi;
  credentials?: RazorpayCredentials;
  downloadTokenSecret?: string;
  now?: () => number;
}

async function signature(orderId: string, paymentId: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${orderId}|${paymentId}`),
    ),
  );
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function secureEqual(first: string, second: string) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1)
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return difference === 0;
}

function requireProduct(productId: string) {
  const product = getDigitalProductById(productId);
  if (!product || !product.active)
    throw new StorefrontPaymentError(
      "PRODUCT_UNAVAILABLE",
      "This product is currently unavailable.",
      404,
    );
  return product;
}

function assertProviderTerms(
  product: DigitalProduct,
  provider: { amount: number; currency: string },
) {
  if (provider.amount !== product.priceMinor || provider.currency !== product.currency)
    throw new StorefrontPaymentError(
      "PAYMENT_MISMATCH",
      "This payment could not be verified.",
      400,
    );
}

export class StorefrontPaymentService {
  constructor(private readonly dependencies: Dependencies = {}) {}

  private async setup() {
    const credentials =
      this.dependencies.credentials ?? (await resolveRazorpayCredentials());
    return {
      credentials,
      api: this.dependencies.razorpay ?? new RazorpayClient(credentials),
    };
  }

  async createOrder(productId: string) {
    const product = requireProduct(productId);
    const { credentials, api } = await this.setup();
    const checkoutId = crypto.randomUUID();
    const order = await api.createOrder({
      amount: product.priceMinor,
      currency: product.currency,
      receipt: `ck_${checkoutId}`,
      notes: { product_id: product.id, checkout_id: checkoutId },
    });
    assertProviderTerms(product, order);
    return {
      productId: product.id,
      razorpayOrderId: order.id,
      razorpayKeyId: credentials.keyId,
      amount: product.priceMinor,
      currency: product.currency,
      displayAmount: formatDigitalProductPrice(product.priceMinor, product.currency),
    };
  }

  async verify(input: {
    productId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) {
    const product = requireProduct(input.productId);
    const { credentials, api } = await this.setup();
    const expected = await signature(
      input.razorpayOrderId,
      input.razorpayPaymentId,
      credentials.keySecret,
    );
    if (!secureEqual(expected, input.razorpaySignature.toLowerCase()))
      throw new StorefrontPaymentError(
        "PAYMENT_VERIFICATION_FAILED",
        "Payment verification failed. If an amount was deducted, please contact support with your payment reference.",
        400,
      );

    const [payment, order] = await Promise.all([
      api.fetchPayment(input.razorpayPaymentId),
      api.fetchOrder(input.razorpayOrderId),
    ]);
    if (
      payment.id !== input.razorpayPaymentId ||
      payment.orderId !== input.razorpayOrderId ||
      order.id !== input.razorpayOrderId ||
      !order.receipt.startsWith("ck_") ||
      order.notes?.product_id !== product.id
    )
      throw new StorefrontPaymentError(
        "PAYMENT_MISMATCH",
        "This payment could not be matched to the product.",
        400,
      );
    assertProviderTerms(product, payment);
    assertProviderTerms(product, order);
    if (payment.status !== "captured" || !payment.captured)
      throw new StorefrontPaymentError(
        "PAYMENT_NOT_CAPTURED",
        "Your payment is still being confirmed. Please try again shortly.",
        409,
      );

    const downloadToken = await createDownloadToken(
      {
        productId: product.id,
        orderId: order.id,
        paymentId: payment.id,
      },
      {
        secret: this.dependencies.downloadTokenSecret,
        now: (this.dependencies.now ?? Date.now)(),
      },
    );
    return { paid: true as const, downloadToken };
  }

  async confirmDownload(input: {
    productId: string;
    orderId: string;
    paymentId: string;
  }) {
    const product = getDigitalProductById(input.productId);
    if (!product)
      throw new StorefrontPaymentError(
        "INVALID_DOWNLOAD",
        "This download link is invalid.",
        404,
      );
    const { api } = await this.setup();
    const payment = await api.fetchPayment(input.paymentId);
    if (
      payment.id !== input.paymentId ||
      payment.orderId !== input.orderId ||
      payment.status !== "captured" ||
      !payment.captured
    )
      throw new StorefrontPaymentError(
        "DOWNLOAD_NOT_AUTHORIZED",
        "This download is not linked to a captured payment.",
        403,
      );
    assertProviderTerms(product, payment);
    return product;
  }
}
