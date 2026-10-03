import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-session";
import { listAdminSliders, revalidateHomeSliderCache } from "@/lib/slider-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    if (!requireAdminSession(request)) {
      return NextResponse.json({ ok: false, message: "Administrator authentication is required." }, { status: 401 });
    }

    const sliders = await listAdminSliders();
    return NextResponse.json({ ok: true, sliders });
  } catch (error) {
    console.error("GET /api/admin/home-sliders failed:", error);
    return NextResponse.json({ ok: false, message: "Failed to load home sliders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!requireAdminSession(request)) {
      return NextResponse.json({ ok: false, message: "Administrator authentication is required." }, { status: 401 });
    }

    const body = await request.json();
    const { sliders } = body;

    if (!Array.isArray(sliders)) {
      return NextResponse.json({ ok: false, message: "Sliders must be an array." }, { status: 400 });
    }

    // Validate all productIds
    const productIds = sliders.map((s) => s.productId).filter(Boolean);
    if (productIds.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      const validIds = new Set(existingProducts.map((p) => p.id));
      for (const s of sliders) {
        if (!validIds.has(s.productId)) {
          return NextResponse.json({ ok: false, message: `Product ID ${s.productId} does not exist.` }, { status: 400 });
        }
      }
    }

    // Replace all slider configurations in a single transaction
    await prisma.$transaction(async (tx) => {
      await tx.homeSlider.deleteMany({});

      if (sliders.length > 0) {
        await tx.homeSlider.createMany({
          data: sliders.map((s, index) => ({
            id: s.id && s.id.length > 10 ? s.id : undefined,
            productId: s.productId,
            selectedImage: s.selectedImage ? String(s.selectedImage).trim() : null,
            sliderOrder: typeof s.sliderOrder === "number" ? s.sliderOrder : index,
            tagline: s.tagline ? String(s.tagline).trim() : null,
            title: s.title ? String(s.title).trim() : null,
            description: s.description ? String(s.description).trim() : null,
            ctaText: s.ctaText ? String(s.ctaText).trim() : null,
            ratingText: s.ratingText ? String(s.ratingText).trim() : null,
            objectPosition: s.objectPosition ? String(s.objectPosition).trim() : null,
            isActive: s.isActive !== false,
          })),
        });
      }
    });

    await revalidateHomeSliderCache();

    const updatedSliders = await listAdminSliders();
    return NextResponse.json({
      ok: true,
      message: "Homepage hero slider updated successfully!",
      sliders: updatedSliders,
    });
  } catch (error) {
    console.error("POST /api/admin/home-sliders failed:", error);
    return NextResponse.json({ ok: false, message: "Failed to save home sliders." }, { status: 500 });
  }
}
