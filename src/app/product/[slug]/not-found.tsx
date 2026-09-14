import Link from "next/link";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import styles from "@/features/storefront/components/storefront.module.css";

export default function ProductNotFound() {
  return (
    <div className={styles.shell}>
      <StorefrontHeader />
      <main className={styles.downloadPage}>
        <section className={`${styles.downloadCard} ${styles.invalidCard}`}>
          <h1>Product unavailable</h1>
          <p>This product link is invalid or the product is no longer available.</p>
          <Link className={styles.textLink} href="/">
            Browse available products
          </Link>
        </section>
      </main>
    </div>
  );
}
