import { NextRequest, NextResponse } from "next/server";
import { recordClientEvent } from "@/lib/analytics/session-service";
import { sendImportantEventAlert } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set([
  "SESSION_START",
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "PRODUCT_IMAGE_VIEW",
  "SEARCH",
  "FILTER_USED",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "VIEW_CART",
  "BEGIN_CHECKOUT",
  "PURCHASE",
  "ORDER_CANCELLED",
  "CHATBOT_OPEN",
  "CHATBOT_CLOSE",
  "CHATBOT_INTERACTION",
  "INSTAGRAM_CLICK",
  "FACEBOOK_CLICK",
  "WHATSAPP_CLICK",
  "NEWSLETTER_SIGNUP",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validation & sanitization
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
    }

    const { sessionId, eventType } = body;
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 64) {
      return NextResponse.json({ ok: false, message: "Invalid sessionId" }, { status: 400 });
    }

    if (!eventType || typeof eventType !== "string" || !ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json({ ok: false, message: "Invalid eventType" }, { status: 400 });
    }

    // 2. Extract geo headers if available from edge/server
    const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "Pakistan";
    const region = request.headers.get("x-vercel-ip-country-region") || undefined;
    const city = request.headers.get("x-vercel-ip-city") || undefined;

    // 3. Record in Database
    await recordClientEvent(body, { country, region, city });

    // 4. Real-Time Alerts for Critical Funnel Milestones
    if (eventType === "BEGIN_CHECKOUT") {
      void sendImportantEventAlert({
        eventTitle: "Checkout Started",
        eventType: "CHECKOUT_STARTED",
        sessionId,
        details: {
          cartTotal: body.metadata?.total ? `Rs. ${body.metadata.total}` : undefined,
          itemCount: body.metadata?.itemCount,
          location: city ? `${city}, ${country}` : country,
        },
      });
    } else if (eventType === "ADD_TO_CART" && body.metadata?.price && body.metadata.price >= 12000) {
      void sendImportantEventAlert({
        eventTitle: "High-Value Item Added to Bag",
        eventType: "HIGH_VALUE_CART",
        sessionId,
        details: {
          productName: body.productName,
          itemPrice: `Rs. ${body.metadata.price}`,
          size: body.metadata.size,
          color: body.metadata.color,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[analytics-api] Event ingestion failed:", err);
    // Non-blocking response: never return 500 error that breaks client
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
