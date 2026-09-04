# LeonardX Update — Escrow + Online Status + Web Push

Added:
- `src/components/EscrowClientCard.tsx`
- `src/components/EscrowFreelancerCard.tsx`
- `src/components/EscrowAdminTable.tsx`
- `src/components/OnlineDot.tsx`
- `src/components/RequestNotification.tsx`
- `src/lib/push.ts`
- Removed the old Socket.IO integration; presence now uses a database heartbeat.
- `src/app/escrow/page.tsx`
- `src/app/messages/page.tsx`
- `src/app/settings/notifications/page.tsx`
- `src/app/admin/escrow/page.tsx`
- `src/app/api/users/heartbeat/route.ts`
- `src/app/api/push/subscribe/route.ts`
- `src/app/api/push/unsubscribe/route.ts`
- `src/app/api/settings/notifications/route.ts`
- `src/app/api/escrow/route.ts`
- `src/app/api/escrow/withdraw/route.ts`
- `src/app/api/escrow/[id]/verify/route.ts`
- `src/app/api/escrow/[id]/release/route.ts`
- `src/app/api/admin/escrow/route.ts`
- `src/app/api/admin/escrow/review/route.ts`
- `src/app/api/admin/withdrawals/route.ts`
- `src/app/api/admin/withdrawals/review/route.ts`
- `public/sw.js`
- `server.js`

Updated:
- `prisma/schema.prisma` with online status, notification preference, escrow, withdrawal and push subscription models.
- `Transaction.commissionRate` default from 15% to 10%.
- Application acceptance to use 10% commission.
- Delivery flow to wait for client escrow release before transaction completion.
- Messages API to create push notifications and database heartbeat events.
- Job proposal API to create push notifications and realtime events.
- Jobs API to expose presence and escrow information.
- Messages/proposal UI with `OnlineDot`.
- AppShell with Escrow, Messages and notification permission UI.
- `.env.example` with VAPID and escrow configuration.
- `package.json` with date-fns, web-push and database heartbeat dependencies.
