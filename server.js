const http = require("http");
const next = require("next");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./src/generated/prisma/client");
require("dotenv/config");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const secret = () => process.env.NEXTAUTH_SECRET || "dev-only-change-me";

function getSessionFromCookie(cookieHeader) {
  const match = cookieHeader?.match(/(?:^|;\s*)leonardx_token=([^;]+)/);
  if (!match) return null;
  try { return jwt.verify(decodeURIComponent(match[1]), secret()); } catch { return null; }
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));
  const io = new Server(server, { path: "/api/socket/io", cors: { origin: true, credentials: true } });
  globalThis.__leonardxIo = io;

  io.on("connection", async (socket) => {
    const session = getSessionFromCookie(socket.handshake.headers.cookie);
    if (!session?.id) { socket.disconnect(true); return; }
    socket.data.userId = session.id;
    socket.join(`user:${session.id}`);
    await prisma.user.update({ where: { id: session.id }, data: { isOnline: true } }).catch(() => undefined);
    io.emit("presence:update", { id: session.id, isOnline: true, lastSeen: null });

    socket.on("disconnect", async () => {
      const remaining = await io.in(`user:${session.id}`).fetchSockets();
      if (remaining.length === 0) {
        const lastSeen = new Date();
        await prisma.user.update({ where: { id: session.id }, data: { isOnline: false, lastSeen } }).catch(() => undefined);
        io.emit("presence:update", { id: session.id, isOnline: false, lastSeen });
      }
    });
  });

  server.listen(port, hostname, () => console.log(`LeonardX ready on http://${hostname}:${port}`));
  const shutdown = async () => { await prisma.$disconnect(); await pool.end(); server.close(() => process.exit(0)); };
  process.on("SIGINT", shutdown); process.on("SIGTERM", shutdown);
});
