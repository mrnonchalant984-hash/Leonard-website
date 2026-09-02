import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function awardBadges() {
  const badges = await prisma.badge.findMany({ where: { active: true } });
  const users = await prisma.user.findMany({ select: { id: true, _count: { select: { referrals: true } } } });
  for (const user of users) for (const badge of badges) if (user._count.referrals >= badge.minReferrals) {
    await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: user.id, badgeId: badge.id } }, update: {}, create: { userId: user.id, badgeId: badge.id } });
  }
}
export async function GET() {
  const session = await getSession(); if (!isAdminSession(session)) return NextResponse.json({error:"Admin required"},{status:403});
  await awardBadges();
  const [users,badges] = await Promise.all([
    prisma.user.findMany({ orderBy:{createdAt:"desc"}, take:100, select:{id:true,fullName:true,email:true,referralCode:true,_count:{select:{referrals:true}},badges:{include:{badge:true}}} }),
    prisma.badge.findMany({orderBy:{minReferrals:"asc"}})
  ]);
  return NextResponse.json({users,badges});
}
export async function POST(r:Request) {
  const session=await getSession(); if(!isAdminSession(session)) return NextResponse.json({error:"Admin required"},{status:403});
  const b=await r.json();
  if(!b.name || !b.description || Number(b.minReferrals)<0) return NextResponse.json({error:"Invalid badge"},{status:400});
  const badge=await prisma.badge.create({data:{name:b.name.trim(),description:b.description.trim(),icon:b.icon||"🏅",minReferrals:Number(b.minReferrals)}});
  await awardBadges(); return NextResponse.json(badge,{status:201});
}
