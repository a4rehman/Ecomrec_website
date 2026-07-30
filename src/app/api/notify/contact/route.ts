import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/emailjs";
import { ContactNotificationData } from "@/types/email";

export async function POST(request: NextRequest) {
  try {
    const data: ContactNotificationData = await request.json();
    const result = await sendContactNotification(data);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    console.error("Contact notification API error:", error);
    return NextResponse.json({ ok: false, message: "Failed to send contact message." }, { status: 500 });
  }
}
