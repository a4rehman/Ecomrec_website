import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrderStatusUpdateNotification } from "@/lib/emailjs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Trigger status update email to customer
    if (order.email) {
      await sendOrderStatusUpdateNotification({
        customerEmail: order.email,
        customerName: order.name,
        orderId: order.id,
        status: order.status
      });
    }

    return NextResponse.json({ ok: true, order }, { status: 200 });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (order && order.email) {
      await sendOrderStatusUpdateNotification({
        customerEmail: order.email,
        customerName: order.name,
        orderId: order.id,
        status: "Cancelled"
      });
    }

    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("Order delete error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
