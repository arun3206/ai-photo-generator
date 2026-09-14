import { z } from "zod";

const productId = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/);

export const createStorefrontOrderSchema = z.object({ productId }).strict();

export const verifyStorefrontPaymentSchema = z
  .object({
    productId,
    razorpayPaymentId: z.string().min(1).max(100),
    razorpayOrderId: z.string().min(1).max(100),
    razorpaySignature: z.string().regex(/^[a-f0-9]{64}$/i),
  })
  .strict();

export function storefrontError(code: string, message: string, status: number) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}
