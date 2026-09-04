export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const s = await getSession();
  if (!isAdminSession(s)) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const { id, action } = await request.json();
  if (!id || !["VERIFY", "REJECT"].includes(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const escrow = await prisma.escrowPayment.findUnique({ where: { id } });
  if (!escrow || escrow.status !== "PENDING") return NextResponse.json({ error: "Escrow payment is no longer pending." }, { status: 409 });
  if (action === "VERIFY") {
    await prisma.escrowPayment.update({ where: { id }, data: { status: "FUNDED", verifiedAt: new Date(), reviewedById: s!.id } });
    await prisma.notification.create({ data: { userId: escrow.freelancerId, type: "PAYMENT", title: "Escrow funded", body: "The client's 100% payment has been verified and is being held safely by LeonardX.", link: "/applications" } });
    return NextResponse.json({ message: "Payment verified. Funds are now held in escrow." });
  }
  await prisma.escrowPayment.update({ where: { id }, data: { status: "REFUNDED", refundedAt: new Date(), reviewedById: s!.id } });
  await prisma.notification.create({ data: { userId: escrow.clientId, type: "PAYMENT", title: "Escrow payment rejected", body: "Your escrow payment could not be verified. Please contact LeonardX support for a refund review.", link: "/support" } });
  return NextResponse.json({ message: "Escrow payment rejected." });
}
