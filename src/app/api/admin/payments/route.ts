import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const proofs = await prisma.paymentProof.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(proofs);
}
