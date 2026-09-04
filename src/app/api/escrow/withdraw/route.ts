export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const [earned, paid, pending] = await Promise.all([
    prisma.transaction.aggregate({ where: { freelancerId: s.id, status: "COMPLETED" }, _sum: { freelancerAmount: true } }),
    prisma.withdrawal.aggregate({ where: { userId: s.id, status: { in: ["APPROVED", "PAID"] } }, _sum: { amount: true } }),
    prisma.withdrawal.aggregate({ where: { userId: s.id, status: "PENDING" }, _sum: { amount: true } }),
  ]);
  const available = Math.max(0, Number(earned._sum.freelancerAmount || 0) - Number(paid._sum.amount || 0) - Number(pending._sum.amount || 0));
  const withdrawals = await prisma.withdrawal.findMany({ where: { userId: s.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ available, withdrawals });
}

export async function POST(request: Request) {
  const s = await getSession();
  if (!s || s.role !== "FREELANCER") return NextResponse.json({ error: "Freelancer login required" }, { status: 403 });
  const body = await request.json();
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount < 2000) return NextResponse.json({ error: "Minimum withdrawal is ₦2,000." }, { status: 400 });
  const [earned, paid, pending] = await Promise.all([
    prisma.transaction.aggregate({ where: { freelancerId: s.id, status: "COMPLETED" }, _sum: { freelancerAmount: true } }),
    prisma.withdrawal.aggregate({ where: { userId: s.id, status: { in: ["APPROVED", "PAID"] } }, _sum: { amount: true } }),
    prisma.withdrawal.aggregate({ where: { userId: s.id, status: "PENDING" }, _sum: { amount: true } }),
  ]);
  const available = Math.max(0, Number(earned._sum.freelancerAmount || 0) - Number(paid._sum.amount || 0) - Number(pending._sum.amount || 0));
  if (amount > available) return NextResponse.json({ error: `Insufficient available balance. You can withdraw up to ₦${available.toLocaleString()}.` }, { status: 400 });
  const bankName = String(body.bankName || "").trim(); const accountName = String(body.accountName || "").trim(); const accountNumber = String(body.accountNumber || "").replace(/\D/g, "");
  if (!bankName || !accountName || accountNumber.length !== 10) return NextResponse.json({ error: "Valid bank name, account name and 10-digit account number are required." }, { status: 400 });
  const withdrawal = await prisma.withdrawal.create({ data: { userId: s.id, amount, bankName, accountName, accountNumber } });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length) await prisma.notification.createMany({ data: admins.map(a => ({ userId: a.id, type: "TRANSACTION" as const, title: "Withdrawal request", body: `${s.fullName} requested a ₦${amount.toLocaleString()} withdrawal.`, link: "/admin/escrow" })) });
  return NextResponse.json({ withdrawal, message: "Withdrawal request submitted. Admin approval is targeted within 24 hours; payment is made manually by bank transfer." }, { status: 201 });
}
