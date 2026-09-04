export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await request.json();
  const endpoint = String(body?.endpoint || "").trim();
  const p256dh = String(body?.keys?.p256dh || "").trim();
  const auth = String(body?.keys?.auth || "").trim();
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });

  const subscription = await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: session.id, p256dh, auth },
    create: { userId: session.id, endpoint, p256dh, auth },
  });

  await prisma.user.update({ where: { id: session.id }, data: { notificationsEnabled: true } });
  return NextResponse.json({ ok: true, id: subscription.id });
}
