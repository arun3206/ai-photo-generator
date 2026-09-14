import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, LockKeyhole, Printer, RefreshCcw } from "lucide-react";
import { getActiveDigitalProducts } from "@/config/digital-products";
import { ProductCard } from "@/features/storefront/components/product-card";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import styles from "@/features/storefront/components/storefront.module.css";

export const metadata: Metadata = {
  title: "CherishKit – Printable Activities, Planners and Digital Kits",
  description:
    "Friendly digital kits for family moments. Download printable activities, worksheets and planners instantly.",
  openGraph: {
    title: "CherishKit – Digital Kits Made for Little Moments",
    description:
      "Printable activities, worksheets and creative kits to download instantly and enjoy anytime.",
    type: "website",
  },
};

const trustItems = [
  { label: "Instant Download", icon: Download },
  { label: "Secure Payment", icon: LockKeyhole },
  { label: "Print Anytime", icon: Printer },
  { label: "No Subscription", icon: RefreshCcw },
] as const;

export default function HomePage() {
  const products = getActiveDigitalProducts();
  const featured = products[0];
  return (
    <div className={styles.shell}>
      <StorefrontHeader
        faqHref={featured ? `/product/${featured.slug}#faq` : undefined}
      />
      <main>
        <section className={styles.catalogueHero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Digital kits made for little moments</p>
              <h1>
                Fun Digital Kits Your Family Will <em>Love</em>
              </h1>
              <p>
                Printable activities, colouring pages, worksheets and creative
                kits—download instantly and enjoy anytime.
              </p>
              <Link className={styles.heroCta} href="#products">
                Explore Products <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
            {featured ? (
              <div className={styles.heroVisual} aria-label="Featured digital product">
                {featured.previewImages[0] ? (
                  <div className={styles.heroMockupSide}>
                    <Image
                      src={featured.previewImages[0].src}
                      alt={featured.previewImages[0].alt}
                      width={800}
                      height={1000}
                      sizes="180px"
                    />
                  </div>
                ) : null}
                <div className={styles.heroMockupMain}>
                  <Image
                    src={featured.thumbnail}
                    alt={`${featured.name} product cover`}
                    width={1080}
                    height={1080}
                    priority
                    sizes="(max-width: 700px) 224px, 304px"
                  />
                </div>
                {featured.previewImages[1] ? (
                  <div className={styles.heroMockupSide}>
                    <Image
                      src={featured.previewImages[1].src}
                      alt={featured.previewImages[1].alt}
                      width={800}
                      height={1000}
                      sizes="180px"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Shopping benefits">
          <div className={styles.trustStripInner}>
            {trustItems.map(({ label, icon: Icon }) => (
              <div className={styles.trustItem} key={label}>
                <Icon size={19} aria-hidden="true" /> {label}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.catalogueSection} id="products">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>Shop digital downloads</p>
            <h2>Pick a kit. Download it. Start enjoying it.</h2>
            <p>No account, subscription or physical delivery required.</p>
          </div>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className={styles.catalogueNote}>
            <Download size={20} aria-hidden="true" />
            <span>
              Every listing explains what is included, how access works and whether the
              product is digital or physical.
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
