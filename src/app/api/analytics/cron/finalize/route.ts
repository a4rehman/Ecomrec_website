import { NextRequest, NextResponse } from "next/server";
import { finalizeExpiredSessions } from "@/lib/analytics/session-finalizer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const timeoutMinutes = parseInt(process.env.ANALYTICS_SESSION_TIMEOUT_MINUTES || "30", 10);
    const finalizedCount = await finalizeExpiredSessions(timeoutMinutes);

    return NextResponse.json({
      ok: true,
      finalizedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || "Finalize job failed" },
      { status: 500 }
    );
  }
}
