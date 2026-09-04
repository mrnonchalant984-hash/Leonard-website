import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ONLINE_WINDOW_MS = 90_000;

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { id: { not: s.id }, role: { in: ["CLIENT", "FREELANCER"] } },
    select: { id: true, fullName: true, role: true, email: true, isOnline: true, lastSeen: true },
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  return NextResponse.json(
    users.map((user) => ({
      ...user,
      isOnline: Boolean(user.isOnline && user.lastSeen && now - user.lastSeen.getTime() < ONLINE_WINDOW_MS),
    })),
  );
}
