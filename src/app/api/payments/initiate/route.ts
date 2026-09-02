import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanAmount, isPaymentPlan } from "@/lib/payment-plans";
import crypto from "crypto";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { amount, plan, receiptUrl, receiptFilename } = await request.json();

  if (!isPaymentPlan(plan)) {
    return NextResponse.json({ error: "Choose a valid premium plan" }, { status: 400 });
  }
  if (typeof receiptUrl !== "string" || !receiptUrl.trim()) {
    return NextResponse.json({ error: "Payment proof upload is required" }, { status: 400 });
  }

  const uploadedProof = await prisma.upload.findFirst({
    where: { userId: session.id, url: receiptUrl.trim() },
    select: { id: true, filename: true },
  });
  if (!uploadedProof) {
    return NextResponse.json({ error: "Payment proof must be uploaded through LeonardX first" }, { status: 400 });
  }

  const expectedAmount = getPlanAmount(plan);
  if (!Number.isInteger(amount) || amount !== expectedAmount) {
    return NextResponse.json({ error: `The ${plan} amount is ₦${expectedAmount.toLocaleString()}` }, { status: 400 });
  }

  const existing = await prisma.payment.findFirst({
    where: { userId: session.id, plan, status: "PENDING" },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a pending payment for this plan. Please wait for admin review." }, { status: 409 });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: session.id,
      reference: `LX-${crypto.randomUUID()}`,
      amount: expectedAmount,
      plan,
      receiptUrl: receiptUrl.trim(),
      receiptFilename: uploadedProof.filename,
    },
  });

  await prisma.notification.create({
    data: {
      userId: session.id,
      type: "PAYMENT",
      title: "Payment submitted",
      body: `Your ${plan} payment proof is pending manual admin review.`,
      link: "/payments",
    },
  });

  return NextResponse.json({ payment, message: "Payment submitted successfully. Status: Pending admin review." }, { status: 201 });
}
