import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { isPremium: true, premiumUntil: true, aiCredits: true } });
  const active = !!user?.isPremium && (!user.premiumUntil || user.premiumUntil > new Date());
  if (!active) return NextResponse.json({ error: "LeonardX AI access is required. Please upgrade your Premium plan." }, { status: 403 });
  if ((user?.aiCredits || 0) <= 0) return NextResponse.json({ error: "Your LeonardX AI credits have finished. Please renew your AI Access plan to continue." }, { status: 402 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "LeonardX AI is temporarily unavailable. Please try again later." }, { status: 503 });

  const { prompt, conversationId } = await request.json();
  if (!prompt?.trim()) return NextResponse.json({ error: "Please enter a message." }, { status: 400 });

  const consumed = await prisma.user.updateMany({ where: { id: session.id, aiCredits: { gt: 0 } }, data: { aiCredits: { decrement: 1 } } });
  if (consumed.count !== 1) return NextResponse.json({ error: "Your LeonardX AI credits have finished. Please renew your AI Access plan to continue." }, { status: 402 });

  try {
    let conversation = conversationId ? await prisma.aIConversation.findFirst({ where: { id: conversationId, userId: session.id } }) : null;
    if (!conversation) conversation = await prisma.aIConversation.create({ data: { userId: session.id, title: prompt.trim().slice(0, 60) } });
    const history = await prisma.aIMessage.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "asc" }, take: 30 });
    await prisma.aIMessage.create({ data: { conversationId: conversation.id, role: "user", content: prompt.trim() } });
    const input = [...history.map(m => `${m.role.toUpperCase()}: ${m.content}`), `USER: ${prompt.trim()}`].join("\n\n");

    const resp = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", input }) });
    const data = await resp.json();
    if (!resp.ok) throw new Error("upstream");

    const text = data.output_text || "I’m sorry, I could not generate a response.";
    const message = await prisma.aIMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: text } });
    const latest = await prisma.user.findUnique({ where: { id: session.id }, select: { aiCredits: true } });
    return NextResponse.json({ text, conversationId: conversation.id, message, creditsRemaining: latest?.aiCredits ?? 0 });
  } catch {
    await prisma.user.update({ where: { id: session.id }, data: { aiCredits: { increment: 1 } } }).catch(() => null);
    return NextResponse.json({ error: "LeonardX AI is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
