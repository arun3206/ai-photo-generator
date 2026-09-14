import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/about/page";
import ContactPage from "@/app/contact/page";
import DeliveryPolicyPage from "@/app/delivery-policy/page";
import HomePage from "@/app/(marketing)/page";
import PrivacyPolicyPage from "@/app/privacy-policy/page";
import RefundPolicyPage from "@/app/refund-policy/page";
import TermsPage from "@/app/terms/page";
import { SiteFooter } from "@/components/layout/site-footer";

describe("public launch pages", () => {
  it.each([
    [PrivacyPolicyPage, "Privacy Policy"],
    [TermsPage, "Terms & Conditions"],
    [RefundPolicyPage, "Refund & Cancellation Policy"],
    [DeliveryPolicyPage, "Digital Delivery / Shipping Policy"],
    [ContactPage, "Contact Us"],
    [AboutPage, "About CherishKit"],
  ])("renders the %s route", (Page, heading) => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });

  it("links every required policy and support route from the footer", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy-policy",
    );
    expect(screen.getByRole("link", { name: "Terms & Conditions" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(screen.getByRole("link", { name: "Refund & Cancellation" })).toHaveAttribute(
      "href",
      "/refund-policy",
    );
    expect(screen.getByRole("link", { name: "Digital Delivery" })).toHaveAttribute(
      "href",
      "/delivery-policy",
    );
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("renders the CherishKit catalogue at the site root", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Fun Digital Kits Your Family Will Love",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 3, name: "14,000+ Kids Worksheets" }),
    ).toBeVisible();
  });
});
