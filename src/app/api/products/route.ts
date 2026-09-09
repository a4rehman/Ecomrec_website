import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Product } from "@/data/products";
import { listProducts, productWriteData, safeDatabaseMessage, toProduct } from "@/lib/product-service";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function errorResponse(error: unknown, action: "load" | "save") {
  console.error(`Product ${action} failed:`, error);
  return NextResponse.json(
    { ok: false, error: `Failed to ${action} product`, message: safeDatabaseMessage(error) },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");
    const includeUnpublished = searchParams.get("includeUnpublished") === "true";
    const products = await listProducts(includeUnpublished);
    if (slug) {
      const product = products.find((item) => item.slug === slug);
      return product
        ? NextResponse.json({ ok: true, product })
        : NextResponse.json({ ok: false, message: "Product not found" }, { status: 404 });
    }
    const filtered = category && category !== "All"
      ? products.filter((item) => item.category.toLowerCase() === category.toLowerCase())
      : products;
    // The Hostinger database is geographically distant from some Vercel
    // regions. Cache public catalog reads at the edge so customers never wait
    // on that connection; product writes still invalidate the server cache.
    return NextResponse.json(
      { ok: true, products: filtered },
      { headers: includeUnpublished ? {} : { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600" } },
    );
  } catch (error) {
    return errorResponse(error, "load");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Product>;
    if (!body.name || !body.description || !body.price || body.price <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid product", message: "Name, description, and a valid price are required." }, { status: 400 });
    }
    const baseSlug = (body.slug || body.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!baseSlug) return NextResponse.json({ ok: false, error: "Invalid product", message: "A valid product name is required." }, { status: 400 });

    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;
    const productInput: Omit<Product, "id"> = {
      slug, name: body.name, category: body.category || "Luxury Lawn", brand: body.brand || "Sawera Collection",
      price: Number(body.price), compareAt: body.compareAt, rating: Number(body.rating || 5), reviews: Number(body.reviews || 1),
      badge: body.badge, colors: Array.isArray(body.colors) ? body.colors : [],
      sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes : ["Unstitched"],
      images: Array.isArray(body.images) && body.images.length ? body.images : ["/images/hero_lawn.png"],
      description: body.description, fabric: body.fabric || "Pure Lawn", stock: Number(body.stock ?? 10),
      salePrice: body.salePrice, saleEnd: body.saleEnd,
      status: body.status === "draft" ? "draft" : "published",
      isActive: body.isActive ?? true,
      publishedAt: body.publishedAt,
    };
    const created = await prisma.product.create({ data: productWriteData(productInput) });
    revalidateTag("products");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, product: toProduct(created) }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "save");
  }
}
