LEONARDX PLATFORM UPDATE

1. Copy .env.example to .env, then keep your working DATABASE_URL.
2. Start Prisma Dev if it is not already running: npx prisma dev
3. Apply the new platform tables:
   npx prisma migrate dev --name add_platform_features
4. Generate the client:
   npx prisma generate
5. Create your admin account by setting ADMIN_EMAIL and ADMIN_PASSWORD in .env, then:
   npm run create-admin
6. Start the website:
   npm run dev
7. Open http://localhost:3000

TEST FLOW
- Create a Client account from the home page.
- Create a Freelancer account from the home page (use a different email).
- Log in and open the Dashboard.
- Client posts a job.
- Freelancer logs in and applies for the job.
- Create a chat by selecting another user; messages poll automatically every 3 seconds.
- Submit manual premium payment proof as JPG, PNG, WebP, or PDF.
- Log in with the admin account and approve/reject payment proofs.
- Premium users can use LeonardX AI after OPENAI_API_KEY is configured.

SECURITY NOTE
Do not put real passwords, OpenAI keys, or production secrets inside the ZIP or source control.

PLATFORM COMPLETION UPDATE (September 2026)
1. npm install
2. Copy .env.example to .env and set DATABASE_URL / NEXTAUTH_SECRET.
3. Run: npx prisma migrate dev
4. Run: npx prisma generate
5. Run: npm run dev

New platform features: Profile, job hiring/completion workflow, My Applications, Manage Jobs, 15% commission transactions, notifications, and persistent LeonardX AI conversation history.
Live OPay API/webhook integration is intentionally not included; payments remain manual admin review.
