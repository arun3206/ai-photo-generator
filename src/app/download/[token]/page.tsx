import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import {
  digitalProductDownloadLabel,
  formatDigitalProductPrice,
  getDigitalProductById,
} from "@/config/digital-products";
import { DownloadButton } from "@/features/storefront/components/download-button";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import styles from "@/features/storefront/components/storefront.module.css";
import { verifyDownloadToken } from "@/server/storefront/download-token";

export const metadata: Metadata = {
  title: "Your Download | CherishKit",
  description: "Secure CherishKit digital product download.",
  robots: { index: false, follow: false },
};

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const token = (await params).token;
  let authorization = null;
  try {
    authorization = await verifyDownloadToken(token);
  } catch {
    authorization = null;
  }
  const product = authorization ? getDigitalProductById(authorization.productId) : null;

  if (!authorization || !product) {
    return (
      <div className={styles.shell}>
        <StorefrontHeader />
        <main className={styles.downloadPage}>
          <section className={`${styles.downloadCard} ${styles.invalidCard}`}>
            <h1>Download link unavailable</h1>
            <p>
              This secure link is invalid or has expired. If you completed a payment,
              contact support with your Razorpay payment reference.
            </p>
            <Link className={styles.textLink} href="/">
              Return to CherishKit
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const analyticsProduct = {
    id: product.id,
    name: product.name,
    price: product.priceMinor / 100,
    currency: product.currency,
  };

  return (
    <div className={styles.shell}>
      <StorefrontHeader />
      <main className={styles.downloadPage}>
        <section className={styles.downloadCard}>
          <div className={styles.successIcon}>
            <Check size={32} strokeWidth={3} aria-hidden="true" />
          </div>
          <p className={styles.eyebrow}>Payment successful</p>
          <h1>Your CherishKit Is Ready</h1>
          <p>
            Your payment has been verified. Open your protected worksheet collection below
            and save the link for your personal use.
          </p>
          <div className={styles.downloadSummary}>
            <div>
              <span>Product</span>
              <strong>{product.name}</strong>
            </div>
            <div>
              <span>Amount</span>
              <strong>
                {formatDigitalProductPrice(product.priceMinor, product.currency)}
              </strong>
            </div>
            <div>
              <span>Status</span>
              <strong>
                <ShieldCheck size={16} aria-hidden="true" /> Verified
              </strong>
            </div>
          </div>
          <DownloadButton
            token={token}
            label={digitalProductDownloadLabel(product.file.type)}
            opensInNewTab={product.file.kind === "external_url"}
            product={analyticsProduct}
          />
          <p className={styles.downloadHelp}>
            <strong>Having trouble downloading?</strong>
            <br />
            Try the access button again. It opens the worksheet collection in Google
            Drive. This secure CherishKit link remains available for 30 days.
          </p>
        </section>
      </main>
    </div>
  );
}
