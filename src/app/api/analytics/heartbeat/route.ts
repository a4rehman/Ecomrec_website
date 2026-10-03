import { NextRequest, NextResponse } from "next/server";
import { updateSessionHeartbeat } from "@/lib/analytics/session-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body?.sessionId;

    if (sessionId && typeof sessionId === "string") {
      await updateSessionHeartbeat(sessionId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
