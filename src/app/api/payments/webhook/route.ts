import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const secret = process.env.OPAY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "OPAY_WEBHOOK_SECRET not configured" },
      { status: 503 }
    );
  }

  const supplied = request.headers.get("x-webhook-secret");

  if (supplied !== secret) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const reference = body.reference;

  if (!reference) {
    return NextResponse.json(
      { error: "Missing reference" },
      { status: 400 }
    );
  }

  const success =
    body.status === "SUCCESS" ||
    body.status === "PAID";

  const payment = await prisma.payment.update({
    where: {
      reference,
    },
    data: {
      status: success ? "APPROVED" : "REJECTED",
      reviewedAt: success ? new Date() : null,
    },
  });

  return NextResponse.json({
    ok: true,
    payment,
  });
}