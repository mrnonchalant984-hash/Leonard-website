# LeonardX Final Fix

- Restored standard Next.js dev/start scripts; no custom `server.js`.
- Removed Socket.IO and Socket.IO client dependencies and integration.
- Replaced Socket.IO presence with a database heartbeat at `/api/users/heartbeat`.
- Added stale-online handling so users older than 90 seconds show offline/last seen.
- Chat uses normal API polling and remains database-backed.
- Web Push notifications remain enabled and independent of realtime sockets.
- Removed `next/font/google` from the root layout so local/Turbopack development does not depend on Google Fonts or Turbopack's internal font loader.
- LeonardX uses a local system font stack with the existing clean SaaS styling.
- Fixed seed-jobs to use the actual Job table columns and load `.env` via Node's `--env-file` flag.
- Seed jobs are duplicate-safe.
- Removed stale temporary diagnostics and generated Prisma output; `prisma generate` recreates it.
- Kept Prisma 7 + Neon/PostgreSQL + escrow + web push functionality.
