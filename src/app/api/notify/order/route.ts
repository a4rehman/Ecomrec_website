import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email/mailer";
import { OrderNotificationData } from "@/types/email";

export async function POST(request: NextRequest) {
  try {
    const data: OrderNotificationData = await request.json();
    const result = await sendOrderEmail({
      orderId: data.orderId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      shippingAddress: data.shippingAddress,
      items: data.products.map((p) => ({
        productName: p.productName,
        quantity: p.quantity,
        size: p.size,
        color: p.color,
        unitPrice: p.unitPrice,
        lineTotal: p.lineTotal,
      })),
      totalAmount: data.totalAmount,
      dateTime: data.dateTime || new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
      status: data.actionType || "Placed",
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Order notification API error:", error);
    return NextResponse.json({ ok: false, message: "Failed to send order notification." }, { status: 200 });
  }
}
