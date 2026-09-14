"use client";

import { useEffect } from "react";
import { trackDigitalProductViewed } from "@/lib/analytics";

export function ProductAnalytics(props: {
  id: string;
  name: string;
  price: number;
  currency: string;
}) {
  const { id, name, price, currency } = props;
  useEffect(
    () => trackDigitalProductViewed({ id, name, price, currency }),
    [currency, id, name, price],
  );
  return null;
}
