LEONARDX VERCEL + CLOUDINARY DEPLOYMENT CHECKLIST

1. In Cloudinary, save the unsigned upload preset:
   leonardx_payment_proofs

2. In Vercel > Project > Settings > Environment Variables, add:
   DATABASE_URL
   NEXTAUTH_SECRET
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=leonardx_payment_proofs

3. Optional server-side fallback variables:
   CLOUDINARY_CLOUD_NAME
   CLOUDINARY_UPLOAD_PRESET

4. Redeploy the latest code. Environment variables with NEXT_PUBLIC_ are embedded during the build,
   so you must redeploy after adding or changing them.

5. Test the complete flow:
   - Log in
   - Open /payments
   - Choose a payment proof under 10MB
   - Submit
   - Confirm the file appears in Cloudinary
   - Confirm the Payment and Upload records appear in Neon
   - Log in as admin
   - Open /admin
   - Approve or reject the payment
   - Confirm premium access changes automatically

IMPORTANT:
The old Vercel error:
ENOENT: no such file or directory, mkdir '/var/task/public'
comes from an older local-storage upload implementation. This updated project does not create
/var/task/public for payment proofs.
