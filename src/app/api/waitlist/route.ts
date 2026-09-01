import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const waitlistSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  skill: z.string().trim().min(2, "Please enter your skill.").max(100),
  email: z.string().trim().email("Please enter a valid email address."),
  portfolioUrl: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined)
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      "Portfolio URL must start with http:// or https://"
    ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = waitlistSchema.parse(body);

    const existing = await prisma.waitlist.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { message: "This email is already on the LeonardX waitlist." },
        { status: 409 }
      );
    }

    const entry = await prisma.waitlist.create({
      data: {
        fullName: data.fullName,
        skill: data.skill,
        email: data.email.toLowerCase(),
        portfolioUrl: data.portfolioUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Welcome to the LeonardX waitlist!",
        entry: { id: entry.id, fullName: entry.fullName },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Invalid form data." },
        { status: 400 }
      );
    }

    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
