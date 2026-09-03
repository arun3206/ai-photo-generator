import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SiteFooter } from "@/components/layout/site-footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Yaadon", template: "%s | Yaadon" },
  description: "Turn two separate photos into one beautiful family memory.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffdf5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-content">{children}</div>
        <SiteFooter />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
