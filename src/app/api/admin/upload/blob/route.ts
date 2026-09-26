/**
 * This route previously handled Vercel Blob client-upload token generation.
 * Image uploads now go directly from the browser to Cloudinary using an
 * unsigned upload preset — this endpoint is no longer used.
 *
 * Kept as a 410 Gone stub so any stale client request gets a clear error
 * instead of a generic 404.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "This upload endpoint has been removed. Images are uploaded directly to Cloudinary from the browser.",
    },
    { status: 410 }
  );
}
