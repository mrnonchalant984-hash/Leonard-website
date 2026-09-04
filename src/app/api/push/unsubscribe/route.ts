export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const endpoint = String(body?.endpoint || "").trim();
  if (endpoint) await prisma.pushSubscription.deleteMany({ where: { userId: session.id, endpoint } });
  else await prisma.pushSubscription.deleteMany({ where: { userId: session.id } });
  await prisma.user.update({ where: { id: session.id }, data: { notificationsEnabled: false } });
  return NextResponse.json({ ok: true });
}
