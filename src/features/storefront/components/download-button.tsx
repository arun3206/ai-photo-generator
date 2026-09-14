"use client";

import { Download, ExternalLink } from "lucide-react";
import { trackDigitalProductDownloaded } from "@/lib/analytics";
import styles from "./storefront.module.css";

export function DownloadButton(props: {
  token: string;
  label: string;
  opensInNewTab?: boolean;
  product: { id: string; name: string; price: number; currency: string };
}) {
  return (
    <div className={styles.downloadControl}>
      <a
        className={styles.downloadButton}
        href={`/api/storefront/download?token=${encodeURIComponent(props.token)}`}
        target={props.opensInNewTab ? "_blank" : undefined}
        rel={props.opensInNewTab ? "noopener noreferrer" : undefined}
        onClick={() => trackDigitalProductDownloaded(props.product)}
      >
        {props.opensInNewTab ? (
          <ExternalLink aria-hidden="true" />
        ) : (
          <Download aria-hidden="true" />
        )}
        {props.label}
      </a>
    </div>
  );
}
