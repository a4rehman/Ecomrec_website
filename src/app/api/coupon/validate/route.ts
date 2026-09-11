import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Valid coupon definitions
const ACTIVE_COUPONS: Record<string, { discountPercent: number; minOrder?: number; description: string }> = {
  SAWERA15: {
    discountPercent: 15,
    description: "15% off on your luxury order"
  },
  WELCOME10: {
    discountPercent: 10,
    description: "10% welcome discount"
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal) || 0;

    if (!code) {
      return NextResponse.json({ ok: false, message: "Please enter a coupon code." }, { status: 400 });
    }

    const coupon = ACTIVE_COUPONS[code];

    if (!coupon) {
      return NextResponse.json({ ok: false, message: "Invalid or expired coupon code." }, { status: 400 });
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({
        ok: false,
        message: `This coupon requires a minimum order of Rs. ${coupon.minOrder.toLocaleString()}.`
      }, { status: 400 });
    }

    const discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);

    return NextResponse.json({
      ok: true,
      code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      description: coupon.description,
      message: `${coupon.discountPercent}% discount applied successfully!`
    }, { status: 200 });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ ok: false, message: "Failed to validate coupon." }, { status: 500 });
  }
}
