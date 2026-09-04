import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const now = new Date();
  await prisma.user.update({
    where: { id: session.id },
    data: { isOnline: true, lastSeen: now },
  });

  return NextResponse.json({ ok: true, isOnline: true, lastSeen: now.toISOString() });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: true });

  const now = new Date();
  await prisma.user.update({
    where: { id: session.id },
    data: { isOnline: false, lastSeen: now },
  });

  return NextResponse.json({ ok: true, isOnline: false, lastSeen: now.toISOString() });
}
