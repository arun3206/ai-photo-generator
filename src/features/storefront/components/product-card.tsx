import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import {
  digitalProductDiscount,
  formatDigitalProductPrice,
  type DigitalProduct,
} from "@/config/digital-products";
import styles from "./storefront.module.css";

export function ProductCard({ product }: { product: DigitalProduct }) {
  const discount = digitalProductDiscount(product);
  return (
    <article className={styles.productCard}>
      <Link className={styles.productCardImage} href={`/product/${product.slug}`}>
        <Image
          src={product.thumbnail}
          alt={`${product.name} product cover`}
          width={1080}
          height={1080}
          sizes="(max-width: 720px) 92vw, 420px"
        />
        {product.badge ? (
          <span className={styles.productBadge}>{product.badge}</span>
        ) : null}
      </Link>
      <div className={styles.productCardBody}>
        <div className={styles.instantLabel}>
          <Download size={16} aria-hidden="true" /> Instant digital download
        </div>
        <h3>
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p>{product.shortDescription}</p>
        <div className={styles.cardOffer}>
          <span className={styles.oldPrice}>
            {formatDigitalProductPrice(product.originalPriceMinor, product.currency)}
          </span>
          <strong>
            {formatDigitalProductPrice(product.priceMinor, product.currency)}
          </strong>
          {discount ? <span className={styles.discount}>{discount}% off</span> : null}
        </div>
        <Link className={styles.cardCta} href={`/product/${product.slug}`}>
          View Product <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
