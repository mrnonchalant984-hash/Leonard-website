import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maxSize = 10 * 1024 * 1024;

function getCloudinaryConfig() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "";

  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    "";

  return { cloudName: cloudName.trim(), uploadPreset: uploadPreset.trim() };
}

function cloudinaryHostAllowed(value: string, cloudName: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    const validHost =
      hostname === "res.cloudinary.com" ||
      hostname.endsWith(".res.cloudinary.com") ||
      hostname === "cloudinary.com" ||
      hostname.endsWith(".cloudinary.com");

    if (!validHost) return false;
    if (!cloudName) return false;

    // Cloudinary delivery URLs normally contain /<cloudName>/ in the path.
    // Decode first so unusual but valid encoded paths are handled safely.
    const path = decodeURIComponent(url.pathname);
    return path.includes(`/${cloudName}/`);
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
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET (or the NEXT_PUBLIC_ equivalents) to Vercel Production environment variables, then redeploy."
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`,
    { method: "POST", body: form }
  );

  const data: {
    secure_url?: unknown;
    error?: { message?: unknown };
  } = await response.json().catch(() => ({}));

  if (!response.ok || typeof data.secure_url !== "string") {
    const cloudinaryMessage =
      typeof data.error?.message === "string"
        ? data.error.message
        : `Cloudinary upload failed with HTTP ${response.status}.`;

    throw new Error(cloudinaryMessage);
  }

  return data.secure_url;
}

/**
 * Accepts either:
 * 1. JSON containing a Cloudinary secure URL (preferred when the browser
 *    performs the unsigned upload), or
 * 2. multipart/form-data for the server-side compatibility fallback.
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

      const filename =
        typeof body.filename === "string" ? body.filename.trim() : "";
      const url = typeof body.url === "string" ? body.url.trim() : "";
      const mimeType =
        typeof body.mimeType === "string" ? body.mimeType : "";
      const size = Number(body.size);

      const { cloudName } = getCloudinaryConfig();

      if (!filename || !url || !mimeType || !Number.isFinite(size)) {
        return NextResponse.json(
          { error: "Incomplete upload data." },
          { status: 400 }
        );
      }

      if (!allowedMimeTypes.has(mimeType)) {
        return NextResponse.json(
          { error: "Only PDF, JPG, PNG, and WebP files are allowed." },
          { status: 400 }
        );
      }

      if (size <= 0 || size > maxSize) {
        return NextResponse.json(
          { error: "File must be between 1 byte and 10MB." },
          { status: 400 }
        );
      }

      if (!cloudinaryHostAllowed(url, cloudName)) {
        return NextResponse.json(
          { error: "Invalid Cloudinary proof URL." },
          { status: 400 }
        );
      }

      const upload = await saveUpload(session.id, {
        filename,
        url,
        mimeType,
        size: Math.round(size),
      });

      return NextResponse.json(upload, { status: 201 });
    }

    const file = (await request.formData()).get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File required." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > maxSize) {
      return NextResponse.json(
        { error: "File must be between 1 byte and 10MB." },
        { status: 400 }
      );
    }

    if (!allowedMimeTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, JPG, PNG, and WebP files are allowed." },
        { status: 400 }
      );
    }

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
            : "Could not upload payment proof.",
      },
      { status: 502 }
    );
  }
}
