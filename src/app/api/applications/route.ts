import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPushNotification } from "@/lib/push";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Login required" }, { status: 401 });
  if (s.role === "FREELANCER") return NextResponse.json(await prisma.application.findMany({ where: { freelancerId: s.id }, include: { job: { include: { client: { select: { id: true, fullName: true, isOnline: true, lastSeen: true } }, escrowPayment: true } }, freelancer: { select: { id: true, fullName: true, email: true, isOnline: true, lastSeen: true, skills: true } } }, orderBy: { createdAt: "desc" } }));
  if (s.role === "CLIENT") return NextResponse.json(await prisma.application.findMany({ where: { job: { clientId: s.id } }, include: { job: { include: { escrowPayment: true } }, freelancer: { select: { id: true, fullName: true, email: true, skills: true, isOnline: true, lastSeen: true } } }, orderBy: { createdAt: "desc" } }));
  return NextResponse.json([]);
}

export async function POST(r: Request) {
  const s = await getSession();
  if (!s || s.role !== "FREELANCER") return NextResponse.json({ error: "Freelancer login required" }, { status: 403 });
  const { jobId, coverLetter } = await r.json();
  if (!jobId || !coverLetter?.trim()) return NextResponse.json({ error: "Job and cover letter are required" }, { status: 400 });
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "OPEN") return NextResponse.json({ error: "This job is no longer open" }, { status: 400 });
    const app = await prisma.application.create({ data: { jobId, freelancerId: s.id, coverLetter: coverLetter.trim() } });
    await prisma.notification.create({ data: { userId: job.clientId, type: "APPLICATION", title: "New application received", body: `${s.fullName} applied for ${job.title}`, link: "/applications" } });
    void sendPushNotification(job.clientId, "New job proposal received", `${s.fullName} applied for ${job.title}.`, "/applications");
    return NextResponse.json(app, { status: 201 });
  } catch { return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 }); }
}
