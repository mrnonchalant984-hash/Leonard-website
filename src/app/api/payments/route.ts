import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const proofs = await prisma.paymentProof.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(proofs);
}
