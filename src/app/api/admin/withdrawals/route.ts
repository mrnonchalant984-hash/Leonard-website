export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await getSession();
  if (!isAdminSession(s)) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  return NextResponse.json(await prisma.withdrawal.findMany({ where: { status: "PENDING" }, include: { user: { select: { fullName: true, email: true } } }, orderBy: { createdAt: "asc" } }));
}
