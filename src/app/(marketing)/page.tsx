import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { MobilePageContainer } from "@/components/layout/mobile-page-container";
import { Card } from "@/components/ui/card";
import { formatPrice, pricing } from "@/config/pricing";

export default function HomePage() {
  const price = formatPrice(pricing.offer.amountMinor);
  return (
    <>
      <AppHeader />
      <MobilePageContainer>
        <Card>
          <p className="eyebrow">Personalized AI portraits</p>
          <h1>Turn two separate photos into one beautiful family memory.</h1>
          <p className="muted">
            Create personalized family and festival portraits from your own photographs—no
            prompts or technical setup needed.
          </p>
          <div className="price-card" aria-label={`${price}, ${pricing.offer.label}`}>
            <strong>{price}</strong>
            <span>{pricing.offer.label}</span>
            <p>{pricing.offer.description}</p>
            <p>One purchase includes one AI generation.</p>
          </div>
          <Link className="button" href="/create">
            Create your portrait
          </Link>
          <p className="muted">
            Payments are not collected in the current provider-validation build.
          </p>
        </Card>
      </MobilePageContainer>
    </>
  );
}
