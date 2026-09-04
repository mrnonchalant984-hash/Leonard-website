import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAYMENT_PLANS } from "@/lib/payment-plans";

export async function POST(request: Request) {
  const session = await getSession();

  if (!isAdminSession(session) || !session) {
    return NextResponse.json(
      { error: "Admin required" },
      { status: 403 }
    );
  }

  const { proofId, action, note } = await request.json();

  if (
    !proofId ||
    !["APPROVED", "REJECTED"].includes(action)
  ) {
    return NextResponse.json(
      { error: "Invalid review request" },
      { status: 400 }
    );
  }

  const proof = await prisma.paymentProof.findUnique({
    where: { id: proofId },
  });

  if (!proof || proof.status !== "PENDING") {
    return NextResponse.json(
      { error: "Payment proof is no longer pending" },
      { status: 409 }
    );
  }

  const plan =
    PAYMENT_PLANS[
      proof.plan as keyof typeof PAYMENT_PLANS
    ];

  if (!plan) {
    return NextResponse.json(
      { error: "Plan configuration not found" },
      { status: 500 }
    );
  }

  await prisma.$transaction(async (db) => {
    await db.paymentProof.update({
      where: { id: proof.id },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedById: session.id,
        adminNote: String(note || "").slice(0, 1000),
      },
    });

    if (action === "APPROVED") {
      const user = await db.user.findUnique({
        where: { id: proof.userId },
        select: {
          id: true,
          isPremium: true,
          aiCredits: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const isAI = proof.plan.startsWith("LeonardX AI Access");

      if (isAI) {
        const until = new Date(
          Date.now() +
            (plan.durationDays || 1) * 86400000
        );

        await db.user.update({
          where: { id: user.id },
          data: {
            isPremium: true,
            premiumUntil: until,
            aiCredits: plan.aiCredits,
            aiCreditsTotal: plan.aiCredits,
          },
        });
      } else {
        await db.user.update({
          where: { id: user.id },
          data: {
            apkAccess: true,
          },
        });
      }

      await db.notification.create({
        data: {
          userId: user.id,
          type: "PREMIUM",
          title: "LeonardX AI unlocked",
          body: isAI
            ? "Your LeonardX AI access is now active."
            : "Your LeonardX APK Access has been unlocked.",
          link: "/dashboard/premium",
        },
      });
    } else {
      await db.notification.create({
        data: {
          userId: proof.userId,
          type: "PAYMENT",
          title: "Payment rejected",
          body: "Payment rejected. Please re-upload.",
          link: "/dashboard/premium",
        },
      });
    }
  });

  return NextResponse.json({
    message:
      action === "APPROVED"
        ? "Payment approved and access unlocked."
        : "Payment rejected.",
  });
}