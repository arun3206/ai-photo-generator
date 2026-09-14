import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "About Us",
  description: "About CherishKit digital products and Yaadon personalized AI portraits.",
};

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="About"
      title="About CherishKit"
      intro="CherishKit creates downloadable kits and guided digital experiences for family, creative, and celebration moments."
    >
      <section>
        <h2>Useful digital products, ready when you are</h2>
        <p>
          CherishKit offers printable activities, worksheets, planners, and other digital
          kits through simple one-time purchases. Product pages explain exactly what is
          included before payment.
        </p>
      </section>
      <section>
        <h2>Yaadon personalized portraits</h2>
        <p>
          Our Yaadon experience lets you choose a portrait theme, upload the required
          photograph, and download the finished AI-generated image—without writing prompts
          or choosing technical settings.
        </p>
        <p>
          We are building Yaadon as a mobile-first service for Indian families, with
          particular care for privacy, simple instructions, and culturally relevant
          festive portraits.
        </p>
      </section>
      <section>
        <h2>Create a portrait</h2>
        <p>
          Visit the <Link href="/create">portrait creator</Link> to see the available
          experiences and templates.
        </p>
      </section>
    </LegalPage>
  );
}
