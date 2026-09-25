import crypto from "node:crypto";
import { put, del } from "@vercel/blob";

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  storageProvider: "vercel-blob" | "cloudinary" | "local";
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Determine if code is running in a serverless / Vercel cloud environment.
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
 * Validate image buffer headers (magic bytes) to prevent malicious files disguised as images.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string } {
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

  // WEBP: RIFF .... WEBP (bytes 0-3: 'RIFF', bytes 8-11: 'WEBP')
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
 * Optimizes image buffer using sharp if available, converting to high-quality WebP.
 * Gracefully falls back to the original buffer if sharp is unavailable.
 */
async function optimizeImageBuffer(
  inputBuffer: Buffer,
  _originalMime: string
): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default || sharpModule;

    const pipeline = sharp(inputBuffer, { failOnError: false })
      .rotate() // auto-orient by EXIF
      .resize({
        width: 2000,
        height: 2500,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({ quality: 85, effort: 4 });

    const optimizedBuffer = await pipeline.toBuffer();
    return {
      buffer: optimizedBuffer,
      mimeType: "image/webp",
      extension: ".webp"
    };
  } catch (err) {
    console.warn("Sharp image optimization not applied, using original buffer:", err);
    return {
      buffer: inputBuffer,
      mimeType: _originalMime,
      extension: _originalMime === "image/png" ? ".png" : _originalMime === "image/webp" ? ".webp" : ".jpg"
    };
  }
}

/**
 * Upload an image file to persistent storage (Vercel Blob in production, or local fallback in dev).
 */
export async function uploadImageToStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  clientMimeType?: string
): Promise<UploadResult> {
  // 1. File size check
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image size exceeds maximum limit of 10MB.");
  }
  if (fileBuffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  // 2. Validate magic bytes
  const magicCheck = validateImageMagicBytes(fileBuffer);
  if (!magicCheck.valid) {
    throw new Error("Invalid image format. Allowed formats are JPG, PNG, and WEBP.");
  }

  const detectedMime = magicCheck.detectedMime || clientMimeType || "image/jpeg";
  if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
    throw new Error("Image must be JPG, PNG, or WEBP.");
  }

  // 3. Optimize image buffer
  const { buffer: processedBuffer, mimeType: finalMime, extension } = await optimizeImageBuffer(
    fileBuffer,
    detectedMime
  );

  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(6).toString("hex");
  const cleanBaseName = originalFilename
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 40) || "suit";
  const safeFilename = `products/${cleanBaseName}-${timestamp}-${randomHash}${extension}`;

  // 4. Primary: Vercel Blob Storage (Production & Development with BLOB_READ_WRITE_TOKEN)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken) {
    try {
      const blob = await put(safeFilename, processedBuffer, {
        access: "public",
        contentType: finalMime,
        token: blobToken,
        addRandomSuffix: false
      });

      return {
        url: blob.url,
        filename: safeFilename,
        size: processedBuffer.length,
        mimeType: finalMime,
        storageProvider: "vercel-blob"
      };
    } catch (blobErr: any) {
      console.error("Vercel Blob upload failed:", blobErr);
      throw new Error(`Vercel Blob storage error: ${blobErr?.message || "Failed to store image in Vercel Blob"}`);
    }
  }

  // 5. Secondary: Cloudinary Storage
  const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl || (cloudinaryName && cloudinaryKey && cloudinarySecret)) {
    try {
      const base64Data = `data:${finalMime};base64,${processedBuffer.toString("base64")}`;
      const cloudName = cloudinaryName || (cloudinaryUrl ? cloudinaryUrl.split("@")[1] : "");
      
      const formData = new FormData();
      formData.append("file", base64Data);
      formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "sawera_products");
      formData.append("folder", "sawera/products");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          return {
            url: data.secure_url,
            filename: data.public_id || safeFilename,
            size: processedBuffer.length,
            mimeType: finalMime,
            storageProvider: "cloudinary"
          };
        }
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed:", cloudErr);
    }
  }

  // 6. Serverless / Vercel Runtime Guard
  // On Vercel / serverless runtime, the filesystem is read-only and ephemeral.
  // NEVER attempt filesystem operations (mkdir/writeFile) on Vercel.
  if (isServerlessEnvironment()) {
    throw new Error(
      "Vercel Blob storage is not connected. Please attach a Vercel Blob store in your Vercel Dashboard (Storage -> Create Blob Store) or set the BLOB_READ_WRITE_TOKEN environment variable in Vercel Project Settings."
    );
  }

  // 7. Local Development Fallback (Only on developer machine / localhost outside Vercel)
  try {
    const { promises: fs } = await import("node:fs");
    const path = await import("node:path");

    const localUploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(localUploadsDir, { recursive: true });

    const localFileName = `${cleanBaseName}-${timestamp}-${randomHash}${extension}`;
    const localFilePath = path.join(localUploadsDir, localFileName);

    await fs.writeFile(localFilePath, processedBuffer);

    const publicUrl = `/uploads/products/${localFileName}`;

    return {
      url: publicUrl,
      filename: localFileName,
      size: processedBuffer.length,
      mimeType: finalMime,
      storageProvider: "local"
    };
  } catch (fsErr: any) {
    console.error("Local filesystem write failed:", fsErr);
    throw new Error(
      `Failed to save image: Persistent cloud storage is required. Please set BLOB_READ_WRITE_TOKEN.`
    );
  }
}

/**
 * Safely delete an uploaded image from persistent storage if it was removed.
 */
export async function deleteStoredImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== "string") return false;

  try {
    // 1. Vercel Blob URL
    if (imageUrl.includes("blob.vercel-storage.com")) {
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken) {
        await del(imageUrl, { token: blobToken });
        return true;
      }
    }

    // 2. Local uploads file (only in local dev outside serverless)
    if (!isServerlessEnvironment() && imageUrl.startsWith("/uploads/products/")) {
      const { promises: fs } = await import("node:fs");
      const path = await import("node:path");
      const fileName = path.basename(imageUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", "products", fileName);
      await fs.unlink(filePath).catch(() => {});
      return true;
    }

    return false;
  } catch (err) {
    console.warn(`Failed to delete stored image (${imageUrl}):`, err);
    return false;
  }
}
