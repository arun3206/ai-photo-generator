import type { RazorpayCredentials } from "@/server/payments/razorpay-credentials";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayApi {
  createOrder(input: {
    amount: number;
    currency: "INR";
    receipt: string;
  }): Promise<RazorpayOrder>;
}

export class RazorpayClient implements RazorpayApi {
  constructor(
    private readonly credentials: RazorpayCredentials,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async createOrder(input: { amount: number; currency: "INR"; receipt: string }) {
    const response = await this.fetcher("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${this.credentials.keyId}:${this.credentials.keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...input, partial_payment: false }),
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok || !body || typeof body !== "object")
      throw new Error("Razorpay could not create a test order.");
    const order = body as Record<string, unknown>;
    if (
      typeof order.id !== "string" ||
      typeof order.amount !== "number" ||
      typeof order.currency !== "string"
    )
      throw new Error("Razorpay returned an invalid order.");
    return { id: order.id, amount: order.amount, currency: order.currency };
  }
}
