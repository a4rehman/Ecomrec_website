import { NextRequest, NextResponse } from "next/server";
import { sendSupportEmail } from "@/lib/email/mailer";
import { ContactNotificationData } from "@/types/email";

export async function POST(request: NextRequest) {
  try {
    const data: ContactNotificationData = await request.json();
    const result = await sendSupportEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      dateTime: data.dateTime || new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 200 });
  } catch (error) {
    console.error("Contact notification API error:", error);
    return NextResponse.json({ ok: false, message: "Failed to send contact message." }, { status: 200 });
  }
}
