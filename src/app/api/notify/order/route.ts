import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotification } from "@/lib/emailjs";
import { OrderNotificationData } from "@/types/email";

export async function POST(request: NextRequest) {
  try {
    const data: OrderNotificationData = await request.json();
    const result = await sendOrderNotification(data);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    console.error("Order notification API error:", error);
    return NextResponse.json({ ok: false, message: "Failed to send order notification." }, { status: 500 });
  }
}
