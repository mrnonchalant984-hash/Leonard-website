export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const s = await getSession();
  if (!isAdminSession(s)) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const view = new URL(request.url).searchParams.get("view") || "pending";
  const where = view === "completed" ? { status: "RELEASED" as const } : { status: { in: ["PENDING", "FUNDED", "DELIVERED"] as any } };
  return NextResponse.json(await prisma.escrowPayment.findMany({ where, include: { client: { select: { fullName: true, email: true } }, freelancer: { select: { fullName: true, email: true } }, job: { select: { title: true } } }, orderBy: { createdAt: "desc" } }));
}
