import crypto from "node:crypto";

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  storageProvider: "cloudinary" | "local";
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Returns true when running inside Vercel / any serverless runtime where the
 * filesystem is read-only and ephemeral.
 */
export function isServerlessEnvironment(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_STORAGE)
  );
}

/**
 * Validates image file headers (magic bytes) to prevent disguised malicious files.
 */
export function validateImageMagicBytes(buffer: Buffer): {
  valid: boolean;
  detectedMime?: string;
} {
  if (buffer.length < 12) return { valid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: "image/png" };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, detectedMime: "image/webp" };
  }

  return { valid: false };
}

/**
 * Upload an image buffer to Cloudinary via the server-side REST API.
 * Uses an unsigned upload preset — no API secret is required on the server.
 * Falls back to local filesystem storage only in local dev (non-serverless).
 */
export async function uploadImageToStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  clientMimeType?: string
): Promise<UploadResult> {
  // --- Size guard ---
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image size exceeds the 10 MB limit.");
  }
  if (fileBuffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  // --- Magic-byte validation ---
  const magicCheck = validateImageMagicBytes(fileBuffer);
  if (!magicCheck.valid) {
    throw new Error(
      "Invalid image format. Only JPG, PNG, and WEBP images are accepted."
    );
  }
  const detectedMime = magicCheck.detectedMime || clientMimeType || "image/jpeg";
  if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
    throw new Error("Image must be JPG, PNG, or WEBP.");
  }

  // --- Build a safe filename (used as Cloudinary public_id) ---
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(6).toString("hex");
  const cleanBaseName = originalFilename
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 40) || "product";
  const publicId = `sawera/products/${cleanBaseName}-${timestamp}-${randomHash}`;

  // --- Primary: Cloudinary server-side upload ---
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    try {
      // Convert buffer to base64 data URI for Cloudinary's REST API
      const base64Data = `data:${detectedMime};base64,${fileBuffer.toString("base64")}`;

      const formData = new FormData();
      formData.append("file", base64Data);
      formData.append("upload_preset", uploadPreset);
      formData.append("public_id", publicId);
      formData.append("folder", "sawera/products");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as any)?.error?.message ||
            `Cloudinary responded with HTTP ${res.status}`
        );
      }

      const data = (await res.json()) as { secure_url: string; public_id: string; bytes: number };
      if (!data.secure_url) {
        throw new Error("Cloudinary did not return a secure_url.");
      }

      return {
        url: data.secure_url,
        filename: data.public_id || publicId,
        size: data.bytes ?? fileBuffer.length,
        mimeType: detectedMime,
        storageProvider: "cloudinary",
      };
    } catch (cloudErr: any) {
      console.error("Cloudinary server-side upload failed:", cloudErr);
      throw new Error(
        `Image upload to Cloudinary failed: ${cloudErr?.message || "Unknown error"}`
      );
    }
  }

  // --- Serverless guard (no Cloudinary configured) ---
  if (isServerlessEnvironment()) {
    throw new Error(
      "Image storage is not configured. " +
        "Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET " +
        "in your Vercel project environment variables."
    );
  }

  // --- Local development filesystem fallback ---
  try {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");

    const localUploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(localUploadsDir, { recursive: true });

    const ext =
      detectedMime === "image/png"
        ? ".png"
        : detectedMime === "image/webp"
        ? ".webp"
        : ".jpg";
    const localFileName = `${cleanBaseName}-${timestamp}-${randomHash}${ext}`;
    const localFilePath = path.join(localUploadsDir, localFileName);

    await fs.writeFile(localFilePath, fileBuffer);

    return {
      url: `/uploads/products/${localFileName}`,
      filename: localFileName,
      size: fileBuffer.length,
      mimeType: detectedMime,
      storageProvider: "local",
    };
  } catch (fsErr: any) {
    console.error("Local filesystem write failed:", fsErr);
    throw new Error(
      "Failed to save image locally. Configure Cloudinary for persistent storage."
    );
  }
}

/**
 * Delete a stored product image.
 * For Cloudinary URLs this is a no-op on the server side (management API requires
 * a signed API key; images are cleaned up via Cloudinary dashboard).
 * For local /uploads paths this removes the file from disk.
 */
export async function deleteStoredImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== "string") return false;

  try {
    // Local file cleanup (only in local dev)
    if (!isServerlessEnvironment() && imageUrl.startsWith("/uploads/products/")) {
      const { promises: fs } = await import("node:fs");
      const path = await import("node:path");
      const fileName = path.basename(imageUrl);
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "products",
        fileName
      );
      await fs.unlink(filePath).catch(() => {});
      return true;
    }

    // Cloudinary images are public CDN URLs — deletion requires the signed
    // Cloudinary Admin API (separate from the upload preset).
    // Log for reference but do not throw.
    if (imageUrl.includes("cloudinary.com")) {
      console.info(
        "Cloudinary image deletion skipped (requires signed Admin API):",
        imageUrl
      );
      return false;
    }

    return false;
  } catch (err) {
    console.warn(`Failed to delete stored image (${imageUrl}):`, err);
    return false;
  }
}
