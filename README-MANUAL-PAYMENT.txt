LEONARDX MANUAL PAYMENT + CLOUDINARY UPDATE

This project does NOT use Paystack or Flutterwave.

IMPORTANT VERCEL FIX
Payment proofs now upload directly from the browser to Cloudinary. The file is NOT written
to /var/task/public, so this avoids the Vercel ENOENT error and serverless temporary storage.

PAYMENT FLOW
1. User pays manually to the account shown on /payments.
2. User chooses a premium plan.
3. The browser uploads the proof directly to Cloudinary using an UNSIGNED upload preset.
4. LeonardX saves the Cloudinary secure URL and file metadata to Neon PostgreSQL.
5. A Payment record is created with status PENDING.
6. Admin opens /admin and reviews the proof.
7. Admin APPROVES or REJECTS the payment.
8. Approval automatically unlocks Premium AI or APK access.
9. User sees PENDING / APPROVED / REJECTED and the admin note on /payments.

VERCEL ENVIRONMENT VARIABLES
Required:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

Optional:
- CLOUDINARY_CLOUD_NAME (server-side fallback)
- CLOUDINARY_UPLOAD_PRESET (server-side fallback)
- OPENAI_API_KEY
- OPENAI_MODEL
- NEXT_PUBLIC_APK_DOWNLOAD_URL
- PREMIUM_AI_PRICE_NGN
- PREMIUM_APK_PRICE_NGN
- COMMISSION_RATE
- ADMIN_EMAILS

CLOUDINARY
Create an UNSIGNED upload preset named:
leonardx_payment_proofs

Recommended folder:
leonardx/payment-proofs

Allowed payment proof types:
PDF, JPG, PNG, WebP
Maximum size enforced by LeonardX: 10MB

SECURITY
Do NOT put CLOUDINARY_API_SECRET in NEXT_PUBLIC variables or browser code.
An unsigned upload preset is expected to be public to the browser; keep its use restricted
in Cloudinary settings as much as your plan supports.
