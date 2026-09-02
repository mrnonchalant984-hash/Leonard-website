import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maxSize = 10 * 1024 * 1024;

function cloudinaryHostAllowed(value: string, cloudName: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "res.cloudinary.com" || url.hostname.endsWith(".cloudinary.com")) &&
      (!cloudName || url.pathname.includes(`/${cloudName}/`))
    );
  } catch {
    return false;
  }
}

async function saveUpload(
  userId: string,
  input: { filename: string; url: string; mimeType: string; size: number }
) {
  const existing = await prisma.upload.findFirst({
    where: { userId, url: input.url },
  });

  if (existing) return existing;

  return prisma.upload.create({
    data: {
      userId,
      filename: input.filename,
      url: input.url,
      mimeType: input.mimeType,
      size: input.size,
    },
  });
}

async function uploadToCloudinary(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured on the server.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: form }
  );

  const data = await response.json();
  if (!response.ok || typeof data.secure_url !== "string") {
    throw new Error(data?.error?.message || "Cloudinary upload failed.");
  }

  return data.secure_url as string;
}

/**
 * Preferred production flow:
 * Browser uploads directly to Cloudinary with an unsigned preset, then this
 * endpoint stores the returned secure URL in Neon.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const filename = typeof body.filename === "string" ? body.filename.trim() : "";
      const url = typeof body.url === "string" ? body.url.trim() : "";
      const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
      const size = Number(body.size);
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

      if (!filename || !url || !mimeType || !Number.isFinite(size)) {
        return NextResponse.json({ error: "Incomplete upload data" }, { status: 400 });
      }
      if (!allowedMimeTypes.has(mimeType)) {
        return NextResponse.json({ error: "Only PDF, JPG, PNG, and WebP files are allowed" }, { status: 400 });
      }
      if (size <= 0 || size > maxSize) {
        return NextResponse.json({ error: "File must be between 1 byte and 10MB" }, { status: 400 });
      }
      if (!cloudinaryHostAllowed(url, cloudName)) {
        return NextResponse.json({ error: "Invalid Cloudinary proof URL" }, { status: 400 });
      }

      const upload = await saveUpload(session.id, { filename, url, mimeType, size });
      return NextResponse.json(upload, { status: 201 });
    }

    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > maxSize) {
      return NextResponse.json({ error: "File must be between 1 byte and 10MB" }, { status: 400 });
    }
    if (!allowedMimeTypes.has(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, PNG, and WebP files are allowed" }, { status: 400 });
    }

    // Compatibility fallback for local development and small uploads.
    const url = await uploadToCloudinary(file);
    const upload = await saveUpload(session.id, {
      filename: file.name,
      url,
      mimeType: file.type,
      size: file.size,
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    console.error("Payment proof upload failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not upload payment proof",
      },
      { status: 502 }
    );
  }
}
