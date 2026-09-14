"use client";

import { useEffect, useState } from "react";
import { PurchaseButton } from "@/features/storefront/components/purchase-button";
import styles from "./storefront.module.css";

export function StickyPurchaseBar(props: {
  price: string;
  product: { id: string; name: string; price: number; currency: string };
}) {
  const [primaryVisible, setPrimaryVisible] = useState(true);
  const [finalVisible, setFinalVisible] = useState(false);

  useEffect(() => {
    const primary = document.querySelector("#primary-purchase");
    const final = document.querySelector("#final-purchase");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === primary) setPrimaryVisible(entry.isIntersecting);
          if (entry.target === final) setFinalVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.1 },
    );
    if (primary) observer.observe(primary);
    if (final) observer.observe(final);
    return () => observer.disconnect();
  }, []);

  const visible = !primaryVisible && !finalVisible;
  if (!visible) return null;

  return (
    <aside className={`${styles.stickyPurchase} ${styles.stickyPurchaseVisible}`}>
      <div>
        <small>One-time payment</small>
        <strong>{props.price}</strong>
      </div>
      <PurchaseButton compact label="Get it now" product={props.product} />
    </aside>
  );
}
