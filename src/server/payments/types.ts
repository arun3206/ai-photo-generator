import type { PortraitTemplate } from "@/features/portrait-flow/types";

export type PaymentStatus = "CREATED" | "PAID" | "FAILED" | "VERIFICATION_FAILED";

export interface PaymentRecord {
  id: string;
  generationJobId: string;
  templateId: PortraitTemplate;
  sessionId: string;
  amount: number;
  currency: "INR";
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: number;
  paidAt?: number;
  expiresAt: number;
}

export interface PublicPaymentOrder {
  paymentId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: "INR";
  displayAmount: string;
}
