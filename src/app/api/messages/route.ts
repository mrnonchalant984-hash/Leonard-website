import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPushNotification } from "@/lib/push";

export async function GET(r: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const other = new URL(r.url).searchParams.get("with");
  if (!other) return NextResponse.json({ error: "Missing recipient" }, { status: 400 });
  return NextResponse.json(await prisma.message.findMany({ where: { OR: [{ senderId: s.id, receiverId: other }, { senderId: other, receiverId: s.id }] }, orderBy: { createdAt: "asc" } }));
}

export async function POST(r: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { receiverId, body } = await r.json();
  if (!receiverId || !body?.trim()) return NextResponse.json({ error: "Recipient and message are required" }, { status: 400 });
  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, fullName: true } });
  if (!receiver) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  const m = await prisma.message.create({ data: { senderId: s.id, receiverId, body: body.trim() } });
  await prisma.notification.create({ data: { userId: receiverId, type: "MESSAGE", title: "New message", body: `${s.fullName}: ${body.trim().slice(0, 140)}`, link: "/chat" } });
  void sendPushNotification(receiverId, `New message from ${s.fullName}`, body.trim().slice(0, 140), "/chat");
  return NextResponse.json(m, { status: 201 });
}
