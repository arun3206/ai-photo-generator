import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Digital Delivery Policy",
  description: "How CherishKit delivers downloadable products and Yaadon AI portraits.",
};

export default function DeliveryPolicyPage() {
  return (
    <LegalPage
      eyebrow="Delivery"
      title="Digital Delivery / Shipping Policy"
      intro="CherishKit provides downloadable products and the Yaadon digital image-generation service. Nothing is physically shipped."
    >
      <section>
        <h2>Digital product</h2>
        <p>
          The product is entirely digital. There is no physical product, no courier
          shipment, and no physical shipping charge.
        </p>
      </section>
      <section>
        <h2>Downloadable products</h2>
        <p>
          After Razorpay confirms and our server verifies the payment, you are taken
          directly to a secure access page. Depending on the product, the access button
          downloads a private file or opens a configured Google Drive folder containing
          the purchased files. Version one does not send files by email. The secure
          CherishKit link currently remains valid for 30 days.
        </p>
      </section>
      <section>
        <h2>How delivery works</h2>
        <p>
          For a Yaadon portrait, after you provide the required photograph, select a
          template, confirm permission, and complete payment, generation begins. The
          finished portrait is delivered electronically through Yaadon’s result and
          download interface. Keep the result page available until you have saved your
          portrait.
        </p>
      </section>
      <section>
        <h2>Processing time and delays</h2>
        <p>
          Generation time varies because AI processing is involved. Temporary delays may
          occur because of provider demand, server load, connectivity, safety checks, or a
          technical issue. We do not guarantee an exact delivery time.
        </p>
      </section>
      <section>
        <h2>If delivery fails</h2>
        <p>
          If payment is captured but a verified technical failure prevents generation or
          delivery, contact support. The issue may qualify for regeneration or refund
          under our <Link href="/refund-policy">Refund & Cancellation Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
