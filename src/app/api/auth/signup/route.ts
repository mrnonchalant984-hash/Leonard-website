import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { emailShell, sendMail } from "@/lib/mail";
import crypto from "crypto";

async function createUniqueReferralCode() {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `LX-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const exists = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique referral code");
}

export async function POST(r: Request) {
  try {
    const b = await r.json();
    if (!b.fullName || !b.email || !b.password || !b.role) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (!["CLIENT", "FREELANCER"].includes(b.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    const passwordHash = await bcrypt.hash(b.password, 12);
    let referrerId: string | null = null;
    if (b.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: String(b.referralCode).trim().toUpperCase() }, select: { id: true } });
      if (!referrer) return NextResponse.json({ error: "That referral code is not valid" }, { status: 400 });
      referrerId = referrer.id;
    }
    const referralCode = await createUniqueReferralCode();
    const u = await prisma.user.create({ data: { fullName: b.fullName.trim(), email: b.email.toLowerCase().trim(), passwordHash, role: b.role, phone: b.phone || null, referredById: referrerId, referralCode } });
    if (referrerId) await prisma.referralReward.create({ data: { userId: referrerId, referredUserId: u.id } });
    const token = signToken({ id: u.id, email: u.email, role: u.role, fullName: u.fullName });
    sendMail(u.email, "Welcome to LeonardX 🎉", emailShell(`Congratulations, ${u.fullName}! 🎉`, `<p>Your LeonardX account has been created successfully.</p><p>You can now explore the platform and start your journey as a ${u.role === "CLIENT" ? "Client" : "Freelancer"}.</p><p><strong>Welcome to the future of work.</strong></p>`)).catch((e) => console.error("Welcome email failed:", e.message));
    const res = NextResponse.json({ user: { id: u.id, fullName: u.fullName, email: u.email, role: u.role, referralCode: u.referralCode }, message: "Account created successfully. Check your email for your welcome message." }, { status: 201 });
    res.cookies.set("leonardx_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
    return res;
  } catch { return NextResponse.json({ error: "Email may already be registered" }, { status: 400 }); }
}
