# LeonardX — Escrow, Online Status & Web Push Update

## What changed

### Escrow
- Client SOP: pay 100% to OPay `8037624782` — `Leonard mary philip udoh`.
- LeonardX holds the payment until delivery approval.
- Freelancer payout is 90%; LeonardX marketplace commission is 10%.
- Minimum freelancer withdrawal is ₦2,000.
- Admin withdrawal approval target is 24 hours and payout is manual bank transfer.
- New protected escrow records and withdrawal records are stored in PostgreSQL.
- Client can approve delivered work and release the 90% freelancer amount.
- Admin can verify/refund pending escrow payments and approve/pay/reject withdrawals.

### Online status
- `User.isOnline` and `User.lastSeen` are stored in Prisma.
- database heartbeat is attached by `server.js` for self-hosted Node deployments.
- `/api/users/heartbeat` is the App Router health endpoint.
- `/messages` and proposal/application cards show online/last-seen state.

### Web Push
- Push subscriptions are stored in PostgreSQL.
- `sendPushNotification()` uses VAPID keys and removes expired subscriptions.
- `/settings/notifications` lets users enable/disable browser alerts.
- `/public/sw.js` handles background notifications and notification clicks.
- New messages and new job proposals trigger in-app + push notifications.

## Install

```bash
npm install
```

The update adds `date-fns`, `web-push`, `database heartbeat`, and `database heartbeat-client`.

## Environment

Copy `.env.example` to `.env.local` and set real values.

Generate VAPID keys after installing dependencies:

```bash
npx web-push generate-vapid-keys
```

Put the generated public key in both `VAPID_PUBLIC_KEY` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Keep `VAPID_PRIVATE_KEY` server-only.

## Prisma

After updating `.env.local`:

```bash
npx prisma generate
npx prisma migrate dev --name escrow-online-push
```

For a database that uses push instead of migration history:

```bash
npx prisma db push
npx prisma generate
```

## Run locally

```bash
npm run dev
```

The project now starts through `server.js` so database heartbeat can receive WebSocket upgrades.

## Production / Vercel note

Vercel serverless functions do not provide a long-lived Node HTTP server for database heartbeat. The included database heartbeat implementation therefore requires a persistent Node host for realtime sockets. The database-backed online/last-seen fields, push notifications and normal App Router APIs still work independently. If LeonardX is deployed on Vercel, use a managed realtime provider or host the database heartbeat server separately and set the client URL accordingly.

## Escrow operating procedure (SOP)

1. Client hires a freelancer.
2. Client pays the full project value to the LeonardX OPay account.
3. Client submits the OPay reference and receipt.
4. Admin verifies the payment. Status becomes FUNDED.
5. Freelancer completes the work and submits a delivery.
6. Client reviews the delivery.
7. Client clicks **Approve work & release 90%**.
8. Transaction becomes COMPLETED and 90% becomes the freelancer's available balance.
9. Freelancer requests a withdrawal of at least ₦2,000.
10. Admin approves the request and completes the manual bank transfer, then marks it PAID.

**Refund rule:** if the freelancer does not deliver, the client is protected by the LeonardX guarantee and the admin can process a refund according to the platform's refund/dispute procedure.
