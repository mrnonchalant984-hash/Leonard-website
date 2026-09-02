import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { referralCode: true, referrals: { select: { id: true, fullName: true, createdAt: true } }, badges: { include: { badge: true } } } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ referralCode: user.referralCode, referralCount: user.referrals.length, referrals: user.referrals, badges: user.badges.map(x => x.badge) });
}
