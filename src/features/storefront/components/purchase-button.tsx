"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { purchaseDigitalProduct } from "@/features/storefront/payment-client";
import { trackDigitalCheckoutStarted, trackDigitalPurchase } from "@/lib/analytics";
import styles from "./storefront.module.css";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  label: string;
  compact?: boolean;
  elementId?: string;
}

export function PurchaseButton({ product, label, compact, elementId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "preparing" | "verifying">("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = status !== "idle";

  async function purchase() {
    if (busy) return;
    setError(null);
    setStatus("preparing");
    trackDigitalCheckoutStarted(product);
    try {
      const result = await purchaseDigitalProduct({ id: product.id, name: product.name });
      setStatus("verifying");
      trackDigitalPurchase(result.checkoutResult.razorpay_payment_id, product);
      router.push(`/download/${encodeURIComponent(result.downloadToken)}`);
    } catch (caught) {
      setStatus("idle");
      setError(
        caught instanceof Error
          ? caught.message
          : "Payment could not be completed. Please try again.",
      );
    }
  }

  return (
    <div className={styles.purchaseControl} id={elementId}>
      <button
        className={`${styles.purchaseButton} ${compact ? styles.purchaseButtonCompact : ""}`}
        type="button"
        onClick={purchase}
        disabled={busy}
      >
        {busy ? (
          <LoaderCircle className={styles.spinner} aria-hidden="true" />
        ) : compact ? null : (
          <LockKeyhole aria-hidden="true" size={19} />
        )}
        <span>
          {status === "preparing"
            ? "Preparing secure payment…"
            : status === "verifying"
              ? "Verifying payment…"
              : label}
        </span>
        {!busy && !compact ? <ArrowRight aria-hidden="true" size={20} /> : null}
      </button>
      {error ? (
        <p className={styles.purchaseError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
