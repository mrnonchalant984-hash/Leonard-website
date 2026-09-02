import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Admin required" }, { status: 403 });

  const [users, jobs, pendingPayments, approvedPayments, rejectedPayments, premiumUsers, transactions, commission, gross] = await Promise.all([
    prisma.user.count(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "APPROVED" } }),
    prisma.payment.count({ where: { status: "REJECTED" } }),
    prisma.user.count({ where: { isPremium: true } }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { commissionAmount: true }, where: { status: "COMPLETED" } }),
    prisma.transaction.aggregate({ _sum: { grossAmount: true }, where: { status: "COMPLETED" } }),
  ]);

  return NextResponse.json({
    users, jobs, pendingPayments, approvedPayments, rejectedPayments, premiumUsers, transactions,
    completedCommission: commission._sum.commissionAmount || 0,
    completedGross: gross._sum.grossAmount || 0,
  });
}
