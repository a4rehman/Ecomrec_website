import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Authenticate administrator
  if (!requireAdminSession(request)) {
    return NextResponse.json(
      { ok: false, message: "Administrator authentication is required." },
      { status: 401 }
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        message: "Vercel Blob storage is not connected. Please attach a Blob Store in Vercel Dashboard (Storage -> Create Blob Store) or set the BLOB_READ_WRITE_TOKEN environment variable."
      },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname) => {
        const cleanName = pathname.replace(/[^a-zA-Z0-9._-]/g, "_");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          pathname: `products/${cleanName}`,
          tokenPayload: JSON.stringify({ authorized: true, timestamp: Date.now() }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Direct Vercel Blob upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Vercel Blob upload token handler error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to generate Blob upload token"
      },
      { status: 400 }
    );
  }
}
