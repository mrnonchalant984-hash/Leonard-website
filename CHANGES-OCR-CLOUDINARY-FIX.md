# LeonardX — OCR + Cloudinary Production Fix

## Fixed

- Payment receipt uploads now go directly from the browser to Cloudinary using the unsigned `NEXT_PUBLIC_CLOUDINARY_*` configuration.
- `/api/uploads` registers the Cloudinary secure URL in Neon and also supports the server-side Cloudinary fallback.
- Cloudinary configuration errors now name the exact Vercel environment variables required.
- Premium payment OCR now extracts recipient name, recipient account number, amount, and transaction reference.
- Recipient verification is tolerant of capitalization, spaces and punctuation.
- The LeonardX OPay account number `8037624782` is the strongest recipient match; the account name is a secondary match when the number is not readable.
- OCR checks the submitted amount and transaction reference when those values are supplied.
- OCR never auto-approves a payment. Admin approval remains final.
- Escrow receipt submissions now run the same OCR verification and return a warning when verification cannot be completed.
- Fixed the form reset bug caused by accessing `e.currentTarget` after awaited network requests.
- Job delivery Cloudinary configuration now accepts the same public fallback variables.

## Vercel Production variables

Required for receipt uploads:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Use an **unsigned** Cloudinary upload preset.

Recommended server-side fallbacks:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_UPLOAD_PRESET`

After changing `NEXT_PUBLIC_*` variables, redeploy the Vercel deployment.
