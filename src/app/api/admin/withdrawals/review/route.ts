export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const s = await getSession();
  if (!isAdminSession(s)) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const { id, action } = await request.json();
  if (!id || !["APPROVE", "PAY", "REJECT"].includes(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
  if (!withdrawal) return NextResponse.json({ error: "Withdrawal not found." }, { status: 404 });
  if (action === "APPROVE") {
    if (withdrawal.status !== "PENDING") return NextResponse.json({ error: "Withdrawal is no longer pending." }, { status: 409 });
    await prisma.withdrawal.update({ where: { id }, data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: s!.id } });
    return NextResponse.json({ message: "Withdrawal approved. Complete the manual bank transfer, then mark it Paid." });
  }
  if (action === "PAY") {
    if (!["PENDING", "APPROVED"].includes(withdrawal.status)) return NextResponse.json({ error: "Withdrawal cannot be paid in its current state." }, { status: 409 });
    const reference = withdrawal.transactionRef || `LX-WD-${randomUUID().slice(0, 12).toUpperCase()}`;
    await prisma.withdrawal.update({ where: { id }, data: { status: "PAID", paidAt: new Date(), reviewedAt: withdrawal.reviewedAt || new Date(), reviewedById: s!.id, transactionRef: reference } });
    await prisma.notification.create({ data: { userId: withdrawal.userId, type: "TRANSACTION", title: "Withdrawal paid", body: `Your ₦${withdrawal.amount.toLocaleString()} withdrawal has been paid by manual bank transfer.`, link: "/transactions" } });
    return NextResponse.json({ message: "Withdrawal marked as paid." });
  }
  await prisma.withdrawal.update({ where: { id }, data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: s!.id } });
  return NextResponse.json({ message: "Withdrawal rejected." });
}
