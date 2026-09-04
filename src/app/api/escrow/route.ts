export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { verifyReceiptRecipient } from "@/lib/receipt-ocr";

const rate = () => Number(process.env.COMMISSION_RATE || 10);

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const where = session.role === "CLIENT" ? { clientId: session.id } : session.role === "FREELANCER" ? { freelancerId: session.id } : {};
  return NextResponse.json(await prisma.escrowPayment.findMany({ where, include: { job: { select: { title: true } }, client: { select: { fullName: true } }, freelancer: { select: { fullName: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") return NextResponse.json({ error: "Client login required" }, { status: 403 });
  const { jobId, transactionRef, receiptUrl } = await request.json();
  if (!jobId || !transactionRef || String(transactionRef).trim().length < 10) return NextResponse.json({ error: "A transaction reference of at least 10 characters is required." }, { status: 400 });
  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { escrowPayment: true } });
  if (!job || job.clientId !== session.id || !job.hiredFreelancerId) return NextResponse.json({ error: "Hired project not found." }, { status: 404 });
  if (job.status !== "IN_PROGRESS" && job.status !== "COMPLETED") return NextResponse.json({ error: "This project is not ready for escrow funding." }, { status: 409 });
  if (job.escrowPayment) return NextResponse.json({ error: "This project already has an escrow payment." }, { status: 409 });
  const duplicate = await prisma.escrowPayment.findUnique({ where: { transactionRef: String(transactionRef).trim() } });
  if (duplicate) return NextResponse.json({ error: "That transaction reference has already been submitted." }, { status: 409 });

  let verification: { matched: boolean; warning?: string } = {
    matched: false,
    warning: "Automatic receipt verification was not completed; admin review is required.",
  };

  if (receiptUrl) {
    // OCR is advisory only. A receipt that cannot be read is still sent to
    // admin review rather than being silently accepted or rejected.
    verification = await verifyReceiptRecipient(receiptUrl, {
      expectedAmount: job.budget,
      expectedTransactionRef: String(transactionRef).trim(),
    });
  }

  const commissionRate = rate();
  const commissionAmount = Math.round(job.budget * commissionRate / 100);
  const escrow = await prisma.escrowPayment.create({ data: { jobId: job.id, clientId: session.id, freelancerId: job.hiredFreelancerId, amount: job.budget, commissionRate, commissionAmount, freelancerAmount: job.budget - commissionAmount, transactionRef: String(transactionRef).trim(), receiptUrl: receiptUrl || null } });
  await prisma.transaction.updateMany({ where: { jobId: job.id }, data: { commissionRate, commissionAmount, freelancerAmount: job.budget - commissionAmount, status: "IN_PROGRESS" } });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({ data: admins.map(a => ({ userId: a.id, type: "PAYMENT" as const, title: "Escrow payment pending", body: `${session.fullName} paid ₦${job.budget.toLocaleString()} for ${job.title}. Verify the payment proof.`, link: "/admin/escrow" })) });
    await Promise.all(admins.map(a => sendPushNotification(a.id, "Escrow payment pending", `${session.fullName} paid ₦${job.budget.toLocaleString()} for ${job.title}.`, "/admin/escrow").catch(() => undefined)));
  }
  return NextResponse.json({
    escrow,
    warning: verification.warning,
    message: "Escrow payment submitted. LeonardX will verify the payment before work is released.",
  }, { status: 201 });
}
