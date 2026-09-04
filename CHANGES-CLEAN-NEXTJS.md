# LeonardX clean Next.js update

- Removed the custom `server.js` and Socket.IO server/client dependencies.
- Switched `dev`/`start` to standard Next.js commands.
- Replaced realtime presence with a Next.js heartbeat (`/api/users/heartbeat`) and stale-user cleanup.
- Chat now uses safe 3-second message polling and 15-second people/presence polling.
- Removed Socket.IO emit calls from message/proposal APIs.
- Logout now marks the user offline.
- Delivery now requires verified/funded escrow before a freelancer can submit work.
- Seed script loads `.env` itself and inserts only columns that exist in the current `Job` model.
- Added admin script environment variables to `.env.example`.
- Web Push remains enabled and independent of Socket.IO.
- Prisma generated client is intentionally not bundled; run `npx prisma generate` after install.
