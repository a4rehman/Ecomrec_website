import { NextRequest, NextResponse } from "next/server";
import { finalizeVisitorSession } from "@/lib/analytics/session-finalizer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let sessionId: string | null = null;

    // Handles both JSON and text (sendBeacon)
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      sessionId = body?.sessionId;
    } else {
      const rawText = await request.text();
      try {
        const parsed = JSON.parse(rawText);
        sessionId = parsed?.sessionId;
      } catch {
        sessionId = rawText;
      }
    }

    if (sessionId && typeof sessionId === "string") {
      void finalizeVisitorSession(sessionId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
