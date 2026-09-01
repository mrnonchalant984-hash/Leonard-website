import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminSession } from "@/lib/auth";
import { emailShell, sendMail } from "@/lib/mail";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !isAdminSession(session)) {
    return NextResponse.json(
      { error: "Admin required" },
      { status: 403 }
    );
  }

  const { paymentId, action, note } = await request.json();

  if (
    !paymentId ||
    !["APPROVED", "REJECTED"].includes(action)
  ) {
    return NextResponse.json(
      { error: "Invalid review" },
      { status: 400 }
    );
  }

  const payment = await prisma.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status: action,
      adminNote: note || null,
      reviewedAt: new Date(),
      reviewedById: session.id,
    },
    include: {
      user: true,
    },
  });

  const aiPlan = payment.plan === "Premium AI Access";

  if (action === "APPROVED" && aiPlan) {
    await prisma.user.update({
      where: {
        id: payment.userId,
      },
      data: {
        isPremium: true,
      },
    });
  }

  const approved = action === "APPROVED";

  const body = approved
    ? aiPlan
      ? "Your Premium AI Access is now active. LeonardX AI has been unlocked for your account."
      : "Your Premium APK Download purchase was approved. Your APK download button is now available on the Payments page."
    : `Your payment was rejected.${
        note ? ` Note: ${note}` : ""
      }`;

  await prisma.notification.create({
    data: {
      userId: payment.userId,
      type: approved
        ? aiPlan
          ? "PREMIUM"
          : "PAYMENT"
        : "PAYMENT",
      title: approved
        ? aiPlan
          ? "LeonardX AI unlocked"
          : "APK download unlocked"
        : "Payment review update",
      body,
      link: "/payments",
    },
  });

  sendMail(
    payment.user.email,
    approved
      ? "Your LeonardX purchase was approved 🎉"
      : "LeonardX payment update",
    emailShell(
      approved
        ? "Congratulations! Your purchase is approved 🎉"
        : "Payment review update",
      `<p>Hi ${payment.user.fullName},</p><p>${body}</p>`
    )
  ).catch((error) =>
    console.error("Payment email failed:", error.message)
  );

  return NextResponse.json(payment);
}