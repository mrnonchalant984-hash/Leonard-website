import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanAmount, isPaymentPlan } from "@/lib/payment-plans";
import { verifyReceiptRecipient } from "@/lib/receipt-ocr";

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  try {
    const body = await request.json();
    const plan = body.plan;
    const amount = Number(body.amount);
    const transactionRef = typeof body.transactionRef === "string" ? body.transactionRef.trim() : "";
    const receiptUrl = typeof body.receiptUrl === "string" ? body.receiptUrl.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : "";

    if (!isPaymentPlan(plan)) return NextResponse.json({ error: "Choose a valid LeonardX plan." }, { status: 400 });
    if (amount !== getPlanAmount(plan)) return NextResponse.json({ error: `Amount must be ₦${getPlanAmount(plan).toLocaleString()}.` }, { status: 400 });
    if (transactionRef.length < 10) return NextResponse.json({ error: "Transaction reference must be at least 10 characters." }, { status: 400 });
    if (!receiptUrl) return NextResponse.json({ error: "Payment receipt is required." }, { status: 400 });

    const upload = await prisma.upload.findFirst({
      where: { userId: session.id, url: receiptUrl },
      select: { filename: true, mimeType: true, size: true },
    });
    if (!upload) return NextResponse.json({ error: "Upload the receipt through LeonardX first." }, { status: 400 });
    if (!allowed.has(upload.mimeType)) return NextResponse.json({ error: "Receipt must be JPG, PNG, or PDF." }, { status: 400 });
    if (upload.size > MAX_RECEIPT_SIZE) return NextResponse.json({ error: "Receipt must not exceed 5MB." }, { status: 400 });

    const duplicate = await prisma.paymentProof.findUnique({ where: { transactionRef } });
    if (duplicate) return NextResponse.json({ error: "This transaction reference has already been submitted." }, { status: 409 });

    const pending = await prisma.paymentProof.findFirst({ where: { userId: session.id, plan, status: "PENDING" } });
    if (pending) return NextResponse.json({ error: "You already have a pending submission for this plan." }, { status: 409 });

    let verification: { matched: boolean; warning?: string } = { matched: false, warning: "Receipt recipient could not be automatically verified." };
    if (upload.mimeType.startsWith("image/")) {
      verification = await verifyReceiptRecipient(receiptUrl, {
        expectedAmount: amount,
        expectedTransactionRef: transactionRef,
      });
    } else {
      verification = { matched: false, warning: "PDF receipt saved. Admin will verify the OPay recipient manually." };
    }

    const proof = await prisma.paymentProof.create({
      data: { userId: session.id, plan, amount, transactionRef, receiptUrl, notes },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "PAYMENT" as const,
          title: "New payment proof submitted",
          body: `${session.fullName} submitted ${plan} for ₦${amount.toLocaleString()}.`,
          link: "/admin/payments",
        })),
      });
    }

    return NextResponse.json({
      proof,
      warning: verification.warning,
      message: "Payment submitted. Awaiting admin review.",
    }, { status: 201 });
  } catch (error) {
    console.error("Payment proof submission failed:", error);
    return NextResponse.json({ error: "Payment submission failed. Please try again." }, { status: 500 });
  }
}
