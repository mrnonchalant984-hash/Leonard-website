import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { emailShell, sendMail } from "@/lib/mail";

export async function POST(r: Request) {
  try {
    const b = await r.json();
    if (!b.fullName || !b.email || !b.password || !b.role) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (!["CLIENT", "FREELANCER"].includes(b.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    const passwordHash = await bcrypt.hash(b.password, 12);
    let referrerId: string | null = null;
    if (b.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: String(b.referralCode).trim() }, select: { id: true } });
      referrerId = referrer?.id || null;
    }
    const u = await prisma.user.create({ data: { fullName: b.fullName.trim(), email: b.email.toLowerCase().trim(), passwordHash, role: b.role, phone: b.phone || null, referredById: referrerId } });
    if (referrerId) await prisma.referralReward.create({ data: { userId: referrerId, referredUserId: u.id } });
    const token = signToken({ id: u.id, email: u.email, role: u.role, fullName: u.fullName });
    sendMail(u.email, "Welcome to LeonardX 🎉", emailShell(`Congratulations, ${u.fullName}! 🎉`, `<p>Your LeonardX account has been created successfully.</p><p>You can now explore the platform and start your journey as a ${u.role === "CLIENT" ? "Client" : "Freelancer"}.</p><p><strong>Welcome to the future of work.</strong></p>`)).catch((e) => console.error("Welcome email failed:", e.message));
    const res = NextResponse.json({ user: { id: u.id, fullName: u.fullName, email: u.email, role: u.role }, message: "Account created successfully. Check your email for your welcome message." }, { status: 201 });
    res.cookies.set("leonardx_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
    return res;
  } catch { return NextResponse.json({ error: "Email may already be registered" }, { status: 400 }); }
}
