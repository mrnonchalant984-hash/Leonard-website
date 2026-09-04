import { NextResponse } from "next/server";

/**
 * Socket.IO uses the Node HTTP upgrade handled by server.js. This App Router
 * endpoint is intentionally kept as a health/connection URL so deployments
 * and clients can verify that realtime support is enabled.
 */
export async function GET() {
  return NextResponse.json({ ok: true, service: "LeonardX Socket.IO", endpoint: "/api/socket" });
}
