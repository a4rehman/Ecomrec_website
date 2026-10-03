import { prisma } from "@/lib/db";
import { parseUserAgent, classifyTrafficSource } from "./device-detector";
import { SessionSummaryData } from "@/lib/email/templates";

export interface ClientEventPayload {
  sessionId: string;
  eventType: string;
  path?: string;
  pageTitle?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  productId?: string;
  productName?: string;
  metadata?: Record<string, any>;
  screenWidth?: number;
  screenHeight?: number;
  userAgent?: string;
  timestamp?: number;
}

/**
 * Ensures a session exists and logs the event atomically.
 * Updates session activity timestamp, page count, and milestone flags.
 */
export async function recordClientEvent(payload: ClientEventPayload, reqHeaders?: {
  country?: string;
  region?: string;
  city?: string;
  ip?: string;
}) {
  const { sessionId, eventType, path = "/", pageTitle, metadata } = payload;
  const now = new Date();

  // 1. Device and Traffic Info
  const deviceInfo = parseUserAgent(payload.userAgent);
  const trafficSource = classifyTrafficSource(payload.referrer, payload.utmSource);

  // 2. Identify Funnel Milestone
  const isCart = eventType === "ADD_TO_CART" || eventType === "VIEW_CART";
  const isCheckout = eventType === "BEGIN_CHECKOUT";
  const isPurchase = eventType === "PURCHASE";
  const isPageView = eventType === "PAGE_VIEW";
  const isProductView = eventType === "PRODUCT_VIEW";

  try {
    // 3. Upsert Visitor Session
    const session = await prisma.visitorSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        startedAt: now,
        lastActivityAt: now,
        landingPage: path,
        exitPage: path,
        referrer: payload.referrer || null,
        utmSource: payload.utmSource || null,
        utmMedium: payload.utmMedium || null,
        utmCampaign: payload.utmCampaign || null,
        utmTerm: payload.utmTerm || null,
        utmContent: payload.utmContent || null,
        trafficSource,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        operatingSystem: deviceInfo.operatingSystem,
        screenWidth: payload.screenWidth || null,
        screenHeight: payload.screenHeight || null,
        country: reqHeaders?.country || "Pakistan",
        region: reqHeaders?.region || null,
        city: reqHeaders?.city || null,
        pagesViewed: isPageView ? 1 : 0,
        productsViewed: isProductView ? 1 : 0,
        eventsCount: 1,
        hadCartActivity: isCart,
        hadCheckout: isCheckout,
        hadPurchase: isPurchase,
      },
      update: {
        lastActivityAt: now,
        exitPage: path,
        pagesViewed: isPageView ? { increment: 1 } : undefined,
        productsViewed: isProductView ? { increment: 1 } : undefined,
        eventsCount: { increment: 1 },
        hadCartActivity: isCart ? true : undefined,
        hadCheckout: isCheckout ? true : undefined,
        hadPurchase: isPurchase ? true : undefined,
      },
    });

    // 4. Record the Specific Event (Compacted metadata)
    const compactMetadata = metadata ? JSON.stringify(metadata).slice(0, 1000) : null;

    await prisma.sessionEvent.create({
      data: {
        sessionId,
        eventType,
        page: pageTitle || path,
        path,
        productId: payload.productId || null,
        productName: payload.productName || null,
        metadata: compactMetadata,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : now,
      },
    });

    return session;
  } catch (err) {
    console.error("[analytics-db] Failed to record event:", err);
    return null;
  }
}

/**
 * Updates session heartbeat timestamp
 */
export async function updateSessionHeartbeat(sessionId: string) {
  try {
    const now = new Date();
    await prisma.visitorSession.update({
      where: { sessionId },
      data: { lastActivityAt: now },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Compiles a structured summary of a visitor session from the database.
 */
export async function compileSessionSummary(sessionId: string): Promise<SessionSummaryData | null> {
  try {
    const session = await prisma.visitorSession.findUnique({
      where: { sessionId },
      include: {
        events: {
          orderBy: { timestamp: "asc" },
          take: 100,
        },
      },
    });

    if (!session) return null;

    // Calculate duration
    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.lastActivityAt).getTime();
    const durationSec = Math.max(0, Math.round((end - start) / 1000));

    let durationFormatted = `${durationSec}s`;
    if (durationSec >= 60) {
      const minutes = Math.floor(durationSec / 60);
      const seconds = durationSec % 60;
      durationFormatted = `${minutes}m ${seconds}s`;
    }

    // Extract unique pages and products
    const uniquePages = Array.from(
      new Set(
        session.events
          .filter((e) => e.eventType === "PAGE_VIEW" && e.path)
          .map((e) => e.path!)
      )
    );

    const uniqueProducts = Array.from(
      new Set(
        session.events
          .filter((e) => (e.eventType === "PRODUCT_VIEW" || e.eventType === "ADD_TO_CART") && e.productName)
          .map((e) => e.productName!)
      )
    );

    const location = [session.city, session.region, session.country].filter(Boolean).join(", ");
    const screenSize = session.screenWidth && session.screenHeight
      ? `${session.screenWidth} × ${session.screenHeight}`
      : "Standard";

    return {
      sessionId: session.sessionId,
      userId: session.userId,
      startedAt: session.startedAt.toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
      lastActivityAt: session.lastActivityAt.toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
      durationFormatted,
      trafficSource: session.trafficSource || "Direct",
      referrer: session.referrer,
      utmCampaign: session.utmCampaign,
      deviceType: session.deviceType || "Desktop",
      browser: session.browser || "Browser",
      operatingSystem: session.operatingSystem || "OS",
      screenSize,
      location: location || "Pakistan",
      landingPage: session.landingPage || "/",
      exitPage: session.exitPage || "/",
      pagesVisited: uniquePages,
      productsViewed: uniqueProducts,
      eventsCount: session.eventsCount,
      hadCartActivity: session.hadCartActivity,
      hadCheckout: session.hadCheckout,
      hadPurchase: session.hadPurchase,
    };
  } catch (err) {
    console.error("[analytics-db] Failed to compile session summary:", err);
    return null;
  }
}
