export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { notificationsEnabled: true } });
  return NextResponse.json({ enabled: Boolean(user?.notificationsEnabled) });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { enabled } = await request.json();
  if (typeof enabled !== "boolean") return NextResponse.json({ error: "enabled must be boolean" }, { status: 400 });
  await prisma.user.update({ where: { id: session.id }, data: { notificationsEnabled: enabled } });
  if (!enabled) await prisma.pushSubscription.deleteMany({ where: { userId: session.id } });
  return NextResponse.json({ enabled });
}
