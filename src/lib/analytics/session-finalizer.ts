import { prisma } from "@/lib/db";
import { compileSessionSummary } from "./session-service";
import { sendSessionSummaryEmail } from "@/lib/email/mailer";

/**
 * Finalizes a visitor session atomically and dispatches the summary email to the owner.
 * Deduplicates execution so each session summary is sent at most once.
 */
export async function finalizeVisitorSession(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;

  try {
    const session = await prisma.visitorSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      console.debug(`[session-finalizer] Session not found: ${sessionId}`);
      return false;
    }

    // Deduplication check: Do not send if already sent or has 0 activity
    if (session.summarySent) {
      console.debug(`[session-finalizer] Summary already sent for: ${sessionId}`);
      return true;
    }

    // Only send summary for sessions that had at least 1 meaningful page view or interaction
    if (session.eventsCount < 1) {
      console.debug(`[session-finalizer] Skipping empty session: ${sessionId}`);
      return false;
    }

    const now = new Date();
    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.lastActivityAt).getTime();
    const durationSeconds = Math.max(0, Math.round((end - start) / 1000));

    // Atomically mark session as finalized and summarySent
    const updated = await prisma.visitorSession.updateMany({
      where: {
        sessionId,
        summarySent: false, // ensures only one caller wins race condition
      },
      data: {
        endedAt: now,
        durationSeconds,
        summarySent: true,
        summarySentAt: now,
      },
    });

    if (updated.count === 0) {
      // Another worker/thread already claimed and sent the summary
      return true;
    }

    // Compile summary and dispatch email
    const summaryData = await compileSessionSummary(sessionId);
    if (summaryData) {
      await sendSessionSummaryEmail(summaryData);
    }

    return true;
  } catch (err) {
    console.error("[session-finalizer] Error during session finalization:", err);
    return false;
  }
}

/**
 * Finalizes all sessions that have been inactive for longer than the timeout (e.g. 30 minutes).
 * Can be invoked by a periodic cron endpoint or background worker.
 */
export async function finalizeExpiredSessions(timeoutMinutes = 30): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const expiredSessions = await prisma.visitorSession.findMany({
      where: {
        summarySent: false,
        lastActivityAt: { lt: cutoff },
        eventsCount: { gte: 1 },
      },
      select: { sessionId: true },
      take: 25,
    });

    let finalizedCount = 0;
    for (const s of expiredSessions) {
      const ok = await finalizeVisitorSession(s.sessionId);
      if (ok) finalizedCount++;
    }

    return finalizedCount;
  } catch (err) {
    console.error("[session-finalizer] Error finalizing expired sessions:", err);
    return 0;
  }
}
