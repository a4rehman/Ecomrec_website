import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const [
      totalSessions,
      todaySessions,
      activeSessions,
      cartSessions,
      checkoutSessions,
      purchaseSessions,
      recentSessions,
      topEvents,
    ] = await Promise.all([
      prisma.visitorSession.count().catch(() => 0),
      prisma.visitorSession.count({
        where: { startedAt: { gte: startOfToday } },
      }).catch(() => 0),
      prisma.visitorSession.count({
        where: {
          lastActivityAt: { gte: thirtyMinsAgo },
          endedAt: null,
        },
      }).catch(() => 0),
      prisma.visitorSession.count({
        where: { hadCartActivity: true },
      }).catch(() => 0),
      prisma.visitorSession.count({
        where: { hadCheckout: true },
      }).catch(() => 0),
      prisma.visitorSession.count({
        where: { hadPurchase: true },
      }).catch(() => 0),
      prisma.visitorSession.findMany({
        orderBy: { lastActivityAt: "desc" },
        take: 20,
        select: {
          sessionId: true,
          startedAt: true,
          lastActivityAt: true,
          endedAt: true,
          durationSeconds: true,
          trafficSource: true,
          deviceType: true,
          browser: true,
          operatingSystem: true,
          landingPage: true,
          exitPage: true,
          pagesViewed: true,
          productsViewed: true,
          eventsCount: true,
          hadCartActivity: true,
          hadCheckout: true,
          hadPurchase: true,
          summarySent: true,
        },
      }).catch(() => []),
      prisma.sessionEvent.groupBy({
        by: ["eventType"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }).catch(() => []),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        totalSessions,
        todaySessions,
        activeSessions,
        cartSessions,
        checkoutSessions,
        purchaseSessions,
        conversionRate: totalSessions > 0 ? ((purchaseSessions / totalSessions) * 100).toFixed(1) : "0.0",
        cartRate: totalSessions > 0 ? ((cartSessions / totalSessions) * 100).toFixed(1) : "0.0",
      },
      recentSessions,
      topEvents: topEvents.map((e: any) => ({
        type: e.eventType,
        count: e._count?.id || 0,
      })),
    });
  } catch (error: any) {
    console.error("[analytics-admin-api] Error fetching stats:", error?.message || error);
    return NextResponse.json(
      {
        ok: false,
        stats: {
          totalSessions: 0,
          todaySessions: 0,
          activeSessions: 0,
          cartSessions: 0,
          checkoutSessions: 0,
          purchaseSessions: 0,
          conversionRate: "0.0",
          cartRate: "0.0",
        },
        recentSessions: [],
        topEvents: [],
      },
      { status: 200 }
    );
  }
}
