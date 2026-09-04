import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "FREELANCER") return NextResponse.json({ error: "Freelancer login required" }, { status: 403 });
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.hiredFreelancerId !== s.id || job.status !== "IN_PROGRESS") return NextResponse.json({ error: "This job is not assigned to you." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  const notes = String(form.get("notes") || "").slice(0, 1000);
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Finished job file is required." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Job file must not exceed 10MB." }, { status: 400 });

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    return NextResponse.json({
      error:
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET (or the NEXT_PUBLIC_ equivalents) in Vercel Production and redeploy.",
    }, { status: 503 });
  }

  const cloud = new FormData();
  cloud.append("file", file); cloud.append("upload_preset", preset);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: cloud });
  const data = await up.json();
  if (!up.ok || !data.secure_url) return NextResponse.json({ error: "Could not upload finished work." }, { status: 502 });

  const delivery = await prisma.$transaction(async db => {
    const d = await db.jobDelivery.create({ data: { jobId: id, freelancerId: s.id, fileUrl: data.secure_url, filename: file.name, mimeType: file.type || "application/octet-stream", size: file.size, notes } });
    await db.job.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date() } });
    const tx = await db.transaction.findUnique({ where: { jobId: id } });
    if (tx) await db.transaction.update({ where: { jobId: id }, data: { status: "IN_PROGRESS" } });
    const escrow = await db.escrowPayment.findUnique({ where: { jobId: id } });
    if (escrow && ["FUNDED", "IN_PROGRESS"].includes(escrow.status)) await db.escrowPayment.update({ where: { id: escrow.id }, data: { status: "DELIVERED" } });
    await db.notification.create({ data: { userId: job.clientId, type: "JOB", title: "Job completed", body: `${s.fullName} submitted the finished file for ${job.title}.`, link: "/manage-jobs" } });
    const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length) await db.notification.createMany({ data: admins.map(a => ({ userId: a.id, type: "JOB" as const, title: "New job delivery submitted", body: `${s.fullName} completed ${job.title}.`, link: "/admin/deliveries" })) });
    return d;
  });
  void sendPushNotification(job.clientId, "Work delivered", `${s.fullName} submitted the finished file for ${job.title}. Review and approve the delivery to release escrow.`, "/manage-jobs").catch(() => undefined);
  return NextResponse.json({ delivery, message: "Finished work submitted successfully. The client can now review and release escrow." }, { status: 201 });
}
