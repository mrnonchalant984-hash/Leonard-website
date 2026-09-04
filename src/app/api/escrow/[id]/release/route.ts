export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "CLIENT") return NextResponse.json({ error: "Client login required" }, { status: 403 });
  const { id } = await params;
  const escrow = await prisma.escrowPayment.findUnique({ where: { id }, include: { job: true } });
  if (!escrow || escrow.clientId !== s.id) return NextResponse.json({ error: "Escrow payment not found." }, { status: 404 });
  if (!["DELIVERED", "IN_PROGRESS"].includes(escrow.status)) return NextResponse.json({ error: "This escrow cannot be released yet." }, { status: 409 });
  if (escrow.status === "IN_PROGRESS" && escrow.job.status !== "COMPLETED") return NextResponse.json({ error: "The freelancer must submit the finished work before release." }, { status: 409 });
  await prisma.$transaction(async db => {
    await db.escrowPayment.update({ where: { id }, data: { status: "RELEASED", releasedAt: new Date() } });
    await db.transaction.updateMany({ where: { jobId: escrow.jobId }, data: { status: "COMPLETED", completedAt: new Date(), commissionRate: escrow.commissionRate, commissionAmount: escrow.commissionAmount, freelancerAmount: escrow.freelancerAmount } });
    await db.job.update({ where: { id: escrow.jobId }, data: { status: "COMPLETED", completedAt: new Date() } });
    await db.notification.create({ data: { userId: escrow.freelancerId, type: "TRANSACTION", title: "Escrow released", body: `₦${escrow.freelancerAmount.toLocaleString()} has been released to your LeonardX earnings balance.`, link: "/transactions" } });
  });
  await sendPushNotification(escrow.freelancerId, "Escrow released", `₦${escrow.freelancerAmount.toLocaleString()} has been released to your LeonardX earnings balance.`, "/transactions").catch(() => undefined);
  return NextResponse.json({ message: `Escrow released. ₦${escrow.freelancerAmount.toLocaleString()} is now credited to the freelancer's earnings.` });
}
