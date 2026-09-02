import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      plan: true,
      status: true,
      amount: true,
      reference: true,
      receiptFilename: true,
      adminNote: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  return NextResponse.json({ payments });
}
