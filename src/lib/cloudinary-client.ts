"use client";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function getCloudinaryConfig() {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";

  return { cloudName, uploadPreset };
}

/**
 * Upload a receipt directly from the browser to Cloudinary using an unsigned
 * preset. This avoids Vercel serverless filesystem/upload limitations.
 * The returned URL is then registered with /api/uploads.
 */
export async function uploadPaymentReceipt(file: File) {
  if (!file || file.size <= 0) {
    throw new Error("Choose your payment receipt.");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Receipt must not exceed 5MB.");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Receipt must be JPG, PNG, or PDF.");
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured for uploads. In Vercel Production, add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, then redeploy."
    );
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`,
    {
      method: "POST",
      body,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || typeof data.secure_url !== "string") {
    const detail =
      typeof data?.error?.message === "string"
        ? data.error.message
        : `Cloudinary upload failed with HTTP ${response.status}.`;

    throw new Error(detail);
  }

  const registration = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      url: data.secure_url,
      mimeType: file.type,
      size: file.size,
    }),
  });

  const registered = await registration.json().catch(() => ({}));

  if (!registration.ok) {
    throw new Error(
      registered.error || "Receipt uploaded but could not be registered."
    );
  }

  return registered;
}
