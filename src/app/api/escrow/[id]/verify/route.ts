export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!isAdminSession(s)) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const { id } = await params;
  const escrow = await prisma.escrowPayment.findUnique({ where: { id } });
  if (!escrow || escrow.status !== "PENDING") return NextResponse.json({ error: "Escrow payment is not pending." }, { status: 409 });
  await prisma.$transaction(async db => {
    await db.escrowPayment.update({ where: { id }, data: { status: "FUNDED", verifiedAt: new Date(), reviewedById: s!.id } });
    await db.transaction.updateMany({ where: { jobId: escrow.jobId }, data: { status: "IN_PROGRESS" } });
    await db.notification.create({ data: { userId: escrow.freelancerId, type: "PAYMENT", title: "Escrow funded", body: "The client's 100% payment has been verified and is being held safely by LeonardX.", link: "/applications" } });
  });
  return NextResponse.json({ message: "Escrow payment verified and marked as funded." });
}
