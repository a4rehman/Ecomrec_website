import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { uploadImageToStorage, deleteStoredImage, UploadResult } from "@/lib/image-storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin
    if (!requireAdminSession(request)) {
      return NextResponse.json(
        { ok: false, message: "Administrator authentication is required to upload images." },
        { status: 401 }
      );
    }

    // 2. Read multipart/form-data
    const formData = await request.formData();
    const files: File[] = [];

    // Support both multiple ("files") and single ("file") field keys
    const rawFiles = formData.getAll("files");
    if (rawFiles && rawFiles.length > 0) {
      for (const item of rawFiles) {
        if (item instanceof File) {
          files.push(item);
        }
      }
    }

    const singleFile = formData.get("file");
    if (singleFile instanceof File && !files.includes(singleFile)) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { ok: false, message: "No image files provided in upload request." },
        { status: 400 }
      );
    }

    const uploadResults: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await uploadImageToStorage(buffer, file.name, file.type);
        uploadResults.push(result);
      } catch (fileErr) {
        const message = fileErr instanceof Error ? fileErr.message : "Upload processing failed";
        console.error(`Failed to upload ${file.name}:`, fileErr);
        errors.push(`${file.name}: ${message}`);
      }
    }

    if (uploadResults.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: errors.join(", ") || "Failed to upload any of the selected images."
        },
        { status: 400 }
      );
    }

    const urls = uploadResults.map((r) => r.url);

    return NextResponse.json({
      ok: true,
      url: urls[0],
      urls,
      results: uploadResults,
      warnings: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Internal server error during image upload"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!requireAdminSession(request)) {
      return NextResponse.json(
        { ok: false, message: "Administrator authentication is required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { ok: false, message: "A valid image URL is required for deletion." },
        { status: 400 }
      );
    }

    const deleted = await deleteStoredImage(url);

    return NextResponse.json({
      ok: true,
      deleted,
      message: deleted ? "Image removed from storage." : "Image not found or deletion not required."
    });
  } catch (err) {
    console.error("Delete image error:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to delete image from storage." },
      { status: 500 }
    );
  }
}
