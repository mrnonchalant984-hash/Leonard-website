import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function code() { return `LX-${crypto.randomBytes(4).toString("hex").toUpperCase()}`; }

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let user = await prisma.user.findUnique({ where: { id: session.id }, select: { id:true, referralCode:true, referrals:{select:{id:true,fullName:true,createdAt:true}}, badges:{include:{badge:true}} } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.referralCode) {
    let referralCode = code();
    while (await prisma.user.findUnique({ where: { referralCode }, select: { id: true } })) referralCode = code();
    await prisma.user.update({ where: { id: user.id }, data: { referralCode } });
    user = await prisma.user.findUnique({ where: { id: user.id }, select: { id:true, referralCode:true, referrals:{select:{id:true,fullName:true,createdAt:true}}, badges:{include:{badge:true}} } });
  }
  return NextResponse.json({ referralCode:user!.referralCode, referralCount:user!.referrals.length, referrals:user!.referrals, badges:user!.badges.map(x=>x.badge) });
}
