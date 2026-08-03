import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, address, city, zip, phone, total, status, date, items, method } = body;

    const order = await prisma.order.create({
      data: {
        id,
        name,
        email,
        address,
        city,
        zip,
        phone,
        total,
        status: status || "Processing",
        method: method || "cod",
        date: date || new Date().toLocaleDateString(),
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.id,
            productName: item.name || item.productName || "Product",
            qty: item.qty,
            size: item.size || null,
            color: item.color || null,
            unitPrice: item.price || item.unitPrice || 0
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation API error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");

    const whereCondition = userEmail ? { email: userEmail } : {};

    const orders = await prisma.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: { items: true }
    });

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      address: o.address,
      city: o.city,
      zip: o.zip,
      phone: o.phone,
      total: o.total,
      status: o.status,
      date: o.date,
      method: o.method,
      createdAt: o.createdAt,
      items: o.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        qty: item.qty,
        size: item.size || undefined,
        color: item.color || undefined,
        price: item.unitPrice
      }))
    }));

    return NextResponse.json({ ok: true, orders: formattedOrders }, { status: 200 });
  } catch (error: any) {
    console.error("Order fetch API error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
