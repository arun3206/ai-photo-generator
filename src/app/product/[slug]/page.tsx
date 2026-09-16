import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck2,
  LockKeyhole,
  Printer,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  digitalProductDiscount,
  formatDigitalProductPrice,
  getDigitalProductBySlug,
} from "@/config/digital-products";
import { ProductAnalytics } from "@/features/storefront/components/product-analytics";
import { PurchaseButton } from "@/features/storefront/components/purchase-button";
import { StickyPurchaseBar } from "@/features/storefront/components/sticky-purchase-bar";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import styles from "@/features/storefront/components/storefront.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getDigitalProductBySlug((await params).slug);
  if (!product || !product.active) return { title: "Product unavailable | CherishKit" };
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.seo.openGraphTitle,
      description: product.seo.openGraphDescription,
      images: [{ url: product.seo.openGraphImage }],
      type: "website",
      url: `/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getDigitalProductBySlug((await params).slug);
  if (!product || !product.active) notFound();
  const price = formatDigitalProductPrice(product.priceMinor, product.currency);
  const originalPrice = formatDigitalProductPrice(
    product.originalPriceMinor,
    product.currency,
  );
  const discount = digitalProductDiscount(product);
  const hasOriginalPrice = product.originalPriceMinor > product.priceMinor;
  const analyticsProduct = {
    id: product.id,
    name: product.name,
    price: product.priceMinor / 100,
    currency: product.currency,
  };
  const trustItems = [
    { label: "Instant Download", icon: Download },
    { label: "Organised Digital Bundle", icon: FileCheck2 },
    { label: "Secure Razorpay Payment", icon: LockKeyhole },
    { label: "Print Anytime", icon: Printer },
  ] as const;

  return (
    <div className={styles.shell}>
      <ProductAnalytics {...analyticsProduct} />
      <StorefrontHeader faqHref="#faq" />
      <div className={styles.offerRibbon}>
        <span>{product.ribbonText}</span>
        <strong>{price} one-time</strong>
      </div>
      <main>
        <div className={styles.productPage}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={15} aria-hidden="true" />
            <span>{product.name}</span>
          </nav>
          <section className={styles.productHero}>
            <div className={styles.mainPreview}>
              <Image
                src={product.thumbnail}
                alt={`${product.name} product cover`}
                width={1080}
                height={1080}
                priority
                sizes="(max-width: 700px) 100vw, 50vw"
              />
              {product.badge ? (
                <span className={styles.productBadge}>{product.badge}</span>
              ) : null}
            </div>
            <div className={styles.heroDetails}>
              <p className={styles.eyebrow}>Digital product · Ready to download</p>
              <h1>{product.name}</h1>
              <p className={styles.heroHeadline}>{product.headline}</p>
              <p className={styles.heroDescription}>{product.description}</p>
              <p className={styles.offerLabel}>Special launch price</p>
              <div className={styles.priceRow}>
                {hasOriginalPrice ? (
                  <span className={styles.oldPrice}>{originalPrice}</span>
                ) : null}
                <strong className={`${styles.currentPrice} ${styles.primaryPrice}`}>
                  {price}
                </strong>
                {discount ? (
                  <span className={styles.discount}>Save {discount}%</span>
                ) : null}
              </div>
              <PurchaseButton
                elementId="primary-purchase"
                product={analyticsProduct}
                label={`Get it now – ${price}`}
              />
              <div className={styles.microTrust}>
                <span>Instant digital download</span>
                <span>One-time payment</span>
                <span>No subscription</span>
              </div>
            </div>
          </section>
        </div>

        <section className={styles.trustStrip} aria-label="Product benefits">
          <div className={styles.trustStripInner}>
            {trustItems.map(({ label, icon: Icon }) => (
              <div className={styles.trustItem} key={label}>
                <Icon size={19} aria-hidden="true" /> {label}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionKicker}>Everything included</p>
          <h2 className={styles.sectionTitle}>What You Get</h2>
          <p className={styles.sectionIntro}>
            One secure access link with clearly organised, print-ready content.
          </p>
          <div className={styles.featureGrid}>
            {product.whatYouGet.map((item) => (
              <div className={styles.featureCard} key={item}>
                <CheckCircle2 size={24} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {product.previewImages.length ? (
          <section className={`${styles.section} ${styles.sectionTint}`} id="previews">
            <p className={styles.sectionKicker}>A closer look</p>
            <h2 className={styles.sectionTitle}>See What&apos;s Inside</h2>
            <p className={styles.sectionIntro}>{product.previewIntro}</p>
            <div className={styles.previewRail}>
              {product.previewImages.map((preview) => (
                <figure key={preview.src}>
                  <Image
                    src={preview.src}
                    alt={preview.alt}
                    width={preview.width ?? 1545}
                    height={preview.height ?? 2000}
                    loading="lazy"
                    sizes="(max-width: 700px) 82vw, 33vw"
                  />
                  <figcaption>{preview.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <p className={styles.sectionKicker}>Simple, flexible and immediate</p>
          <h2 className={styles.sectionTitle}>{product.benefitsHeading}</h2>
          <div className={styles.benefitGrid}>
            {product.benefits.map((benefit) => (
              <div className={styles.benefitCard} key={benefit}>
                <Sparkles size={23} aria-hidden="true" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionTint}`}>
          <p className={styles.sectionKicker}>Easy to start</p>
          <h2 className={styles.sectionTitle}>{product.stepsHeading}</h2>
          <p className={styles.sectionIntro}>{product.stepsIntro}</p>
          <ol className={styles.stepsGrid}>
            {product.steps.map((step, index) => (
              <li className={styles.stepCard} key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {product.valueItems.length ? (
          <section className={styles.section}>
            <div className={styles.valueCard}>
              <div className={styles.valueCardHeader}>
                <span className={styles.valueKicker}>Complete digital bundle</span>
                <h2>Everything Inside This Kit</h2>
              </div>
              <ul className={styles.valueList}>
                {product.valueItems.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <strong>
                      {formatDigitalProductPrice(item.valueMinor, product.currency)} value
                    </strong>
                  </li>
                ))}
              </ul>
              <div className={styles.valueTotal}>
                <span>Total value</span>
                <strong>
                  {formatDigitalProductPrice(
                    product.valueItems.reduce(
                      (total, item) => total + item.valueMinor,
                      0,
                    ),
                    product.currency,
                  )}
                </strong>
              </div>
              <div className={styles.todayOffer}>
                <span>Get everything today for</span>
                <strong>{price}</strong>
                <PurchaseButton
                  product={analyticsProduct}
                  label={`Get Instant Access – ${price}`}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <p className={styles.sectionKicker}>Designed for everyday moments</p>
          <h2 className={styles.sectionTitle}>Perfect For</h2>
          <div className={styles.audienceGrid}>
            {product.audience.map((audience) => (
              <div className={styles.audienceCard} key={audience}>
                <UsersRound size={23} aria-hidden="true" />
                <span>{audience}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionTint}`} id="faq">
          <p className={styles.sectionKicker}>Good to know</p>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {product.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.section} id="final-purchase">
          <div className={styles.finalCta}>
            <h2>{product.finalHeading}</h2>
            <p>{product.finalDescription}</p>
            <div className={styles.priceRow}>
              {hasOriginalPrice ? (
                <span className={styles.oldPrice}>{originalPrice}</span>
              ) : null}
              <strong className={styles.currentPrice}>{price}</strong>
              {discount ? (
                <span className={styles.discount}>Save {discount}%</span>
              ) : null}
            </div>
            <PurchaseButton product={analyticsProduct} label={`Get it now – ${price}`} />
          </div>
        </section>
      </main>
      <StickyPurchaseBar price={price} product={analyticsProduct} />
    </div>
  );
}
