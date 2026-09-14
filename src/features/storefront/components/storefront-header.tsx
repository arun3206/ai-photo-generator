import Link from "next/link";
import styles from "./storefront.module.css";

export function StorefrontHeader({ faqHref }: { faqHref?: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.logo} href="/" aria-label="CherishKit home">
          <span aria-hidden="true">♥</span> CherishKit
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/#products">Products</Link>
          {faqHref ? <Link href={faqHref}>FAQ</Link> : null}
        </nav>
      </div>
    </header>
  );
}
