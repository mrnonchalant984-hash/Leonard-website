import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminSession } from "@/lib/auth";
import { emailShell, sendMail } from "@/lib/mail";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isAdminSession(session)) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const { paymentId, action, note } = await request.json();
  if (!paymentId || !["APPROVED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { user: true } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "This payment has already been reviewed" }, { status: 409 });
  }

  const approved = action === "APPROVED";
  const aiPlan = payment.plan === "Premium AI Access";

  const updated = await prisma.$transaction(async (db) => {
    const reviewed = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: action,
        adminNote: typeof note === "string" && note.trim() ? note.trim() : null,
        reviewedAt: new Date(),
        reviewedById: session.id,
      },
    });

    if (approved && aiPlan) {
      await db.user.update({ where: { id: payment.userId }, data: { isPremium: true, premiumUntil: null } });
    }

    const body = approved
      ? aiPlan
        ? "Your Premium AI Access is approved and LeonardX AI is now unlocked."
        : "Your Premium APK Download is approved. The download is now unlocked on your Payments page."
      : `Your payment proof was rejected.${typeof note === "string" && note.trim() ? ` Note: ${note.trim()}` : ""}`;

    await db.notification.create({
      data: {
        userId: payment.userId,
        type: approved && aiPlan ? "PREMIUM" : "PAYMENT",
        title: approved ? (aiPlan ? "LeonardX AI unlocked" : "APK download unlocked") : "Payment review update",
        body,
        link: "/payments",
      },
    });

    return { reviewed, body };
  });

  sendMail(
    payment.user.email,
    approved ? "Your LeonardX purchase was approved 🎉" : "LeonardX payment update",
    emailShell(approved ? "Your purchase was approved 🎉" : "Payment review update", `<p>Hi ${payment.user.fullName},</p><p>${updated.body}</p>`)
  ).catch((error) => console.error("Payment email failed:", error.message));

  return NextResponse.json(updated.reviewed);
}
