import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ACTIVE_COUPONS: Record<string, number> = {
  SAWERA15: 15,
  WELCOME10: 10
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, address, city, zip, phone, status, date, items, method, couponCode } = body;

    if (!name || !email || !address || !city || !phone) {
      return NextResponse.json({ ok: false, message: "Missing required customer or shipping details." }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, message: "Order must contain at least one item." }, { status: 400 });
    }

    // 1. Authoritative server-side product lookup from the live production database.
    //    The client is never trusted for pricing or availability.
    let calculatedSubtotal = 0;
    const validatedItems: {
      productId: string;
      productName: string;
      qty: number;
      size: string | null;
      color: string | null;
      unitPrice: number;
    }[] = [];

    for (const item of items) {
      const productId: string = item.id || "";
      if (!productId) {
        return NextResponse.json(
          { ok: false, message: "One or more cart items are missing a product ID." },
          { status: 400 }
        );
      }

      // Query the live database — never use static catalog or client-supplied price.
      let dbProduct: {
        id: string; name: string; price: number; salePrice: number | null;
        status: string; isActive: boolean;
      } | null = null;

      try {
        dbProduct = await prisma.product.findFirst({
          where: {
            OR: [{ id: productId }, { slug: productId }],
            status: "published",
            isActive: true,
          },
          select: { id: true, name: true, price: true, salePrice: true, status: true, isActive: true },
        });
      } catch (dbLookupError) {
        console.error("Product DB lookup failed during order creation:", dbLookupError);
        return NextResponse.json(
          { ok: false, message: "We could not verify your order right now. Please try again in a moment." },
          { status: 503 }
        );
      }

      if (!dbProduct) {
        return NextResponse.json(
          { ok: false, message: `One or more products in your cart are no longer available. Please refresh the page and try again.` },
          { status: 400 }
        );
      }

      const unitPrice =
        typeof dbProduct.salePrice === "number" && dbProduct.salePrice > 0
          ? dbProduct.salePrice
          : Number(dbProduct.price);
      const qty = Math.max(1, Number(item.qty) || 1);

      calculatedSubtotal += unitPrice * qty;
      validatedItems.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        qty,
        size: item.size || null,
        color: item.color || null,
        unitPrice,
      });
    }

    // 2. Authoritative server-side coupon calculation.
    let discountAmount = 0;
    if (couponCode && typeof couponCode === "string") {
      const normalizedCode = couponCode.trim().toUpperCase();
      const percent = ACTIVE_COUPONS[normalizedCode];
      if (percent) {
        discountAmount = Math.round((calculatedSubtotal * percent) / 100);
      }
    }

    const calculatedGrandTotal = Math.max(0, calculatedSubtotal - discountAmount);
    const orderId = id || `SAW-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Persist to production database. If the DB is unavailable, return an
    //    honest error — never fake a successful order that does not exist.
    try {
      const order = await prisma.order.create({
        data: {
          id: orderId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          city: city.trim(),
          zip: (zip || "").trim(),
          phone: phone.trim(),
          total: calculatedGrandTotal,
          status: status || "Processing",
          method: method || "cod",
          date: date || new Date().toLocaleDateString(),
          items: { create: validatedItems },
        },
        include: { items: true },
      });

      return NextResponse.json({ ok: true, order, total: calculatedGrandTotal }, { status: 201 });
    } catch (dbError: any) {
      console.error("Order DB write failed:", dbError?.message || dbError);
      // Return 503 — the order was NOT recorded. The client must NOT show a success state.
      return NextResponse.json(
        { ok: false, message: "We could not record your order right now due to a temporary issue. Please try again. You have NOT been charged." },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Order API request error:", error);
    return NextResponse.json({ ok: false, message: "Invalid order request payload." }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");

    const whereCondition = userEmail ? { email: userEmail.toLowerCase() } : {};

    try {
      const orders = await prisma.order.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        include: { items: true },
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
          price: item.unitPrice,
        })),
      }));

      return NextResponse.json({ ok: true, orders: formattedOrders }, { status: 200 });
    } catch (dbError) {
      console.warn("Database fetch unavailable:", dbError);
      return NextResponse.json({ ok: true, orders: [] }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Order fetch API error:", error);
    return NextResponse.json({ ok: false, message: "Failed to retrieve orders." }, { status: 500 });
  }
}

