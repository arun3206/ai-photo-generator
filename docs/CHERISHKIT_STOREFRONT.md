# CherishKit storefront launch checklist

The storefront is config-driven from `src/config/digital-products.ts`. The first product is the 14,000+ Kids Worksheets bundle, delivered through a protected redirect to its configured Google Drive folder.

## Add or update a product

1. Add the product record in `src/config/digital-products.ts`. Keep its `id`, `slug`, private object key, amount in minor currency units, display copy, contents, value stack, audience, FAQ, and SEO in that record.
2. Put only public preview artwork under `public/products/<slug>/`. Preview images must represent the delivered file and must not contain testimonials or claims that have not been verified.
3. For private files, upload the final file to the bucket configured by `AWS_SANITIZED_UPLOADS_BUCKET` and use a `private_object` delivery definition. For a protected external destination, use `external_url`; the customer receives that destination only after token and captured-payment verification.
4. Verify the delivered folder or file opens correctly, contains the advertised content, and has the intended sharing permissions.

## Production secrets and settings

Configure these as encrypted server-side secrets. Never expose them through `NEXT_PUBLIC_` variables or client code.

- `DIGITAL_DOWNLOAD_TOKEN_SECRET`: at least 32 random characters. Rotating it invalidates outstanding download links.
- Razorpay credentials: the project currently reads the existing live credentials through `AWS_RAZORPAY_SECRET_ID`; direct `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` variables are also supported by the existing server integration.
- AWS credentials used by the Cloudflare Worker to read the private download bucket.
- `NEXT_PUBLIC_APP_URL=https://cherishkit.com`
- `NEXT_PUBLIC_SUPPORT_EMAIL`: a monitored address shown on legal and error pages.

The production Worker routes are declared for `cherishkit.com` and `www.cherishkit.com` in `wrangler.jsonc`. Confirm both hostnames are active in Cloudflare before launch.

## Payment and delivery checks

1. Exercise a complete Razorpay test-mode purchase on a preview deployment.
2. Confirm the server-created Razorpay order uses the product's configured amount and currency.
3. Confirm a captured payment redirects to `/download/<token>` and the access button opens the configured Google Drive folder.
4. Confirm a tampered or expired token shows the friendly error state and cannot access the file.
5. Test the checkout and download inside Instagram's in-app browser on Android and iPhone.
6. Run one low-value live purchase and refund it before paid promotion.

CherishKit download links expire 30 days after verified payment. The destination Google Drive folder can still be shared by a customer after it is revealed; version 1 intentionally does not implement DRM. Version 1 also does not collect email addresses, so a customer who loses the success link needs support assistance to recover access.
