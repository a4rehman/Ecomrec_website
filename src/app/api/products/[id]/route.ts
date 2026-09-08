import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { Product } from "@/data/products";
import { findProduct, productWriteData, safeDatabaseMessage, toProduct } from "@/lib/product-service";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function failure(error: unknown, action: string) {
  console.error(`Product ${action} failed:`, error);
  return NextResponse.json({ ok: false, error: `Failed to ${action} product`, message: safeDatabaseMessage(error) }, { status: 500 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await findProduct(id, true);
    return product ? NextResponse.json({ ok: true, product }) : NextResponse.json({ ok: false, message: "Product not found" }, { status: 404 });
  } catch (error) {
    return failure(error, "load");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await findProduct(id, true);
    if (!existing) return NextResponse.json({ ok: false, message: "Product not found" }, { status: 404 });
    const body = await request.json() as Partial<Product>;
    const { id: _productId, ...existingInput } = existing;
    const merged: Omit<Product, "id"> = {
      ...existingInput,
      ...body,
      slug: existing.slug,
      colors: Array.isArray(body.colors) ? body.colors : existing.colors,
      sizes: Array.isArray(body.sizes) ? body.sizes : existing.sizes,
      images: Array.isArray(body.images) ? body.images : existing.images,
    };
    const updated = await prisma.product.update({ where: { id: existing.id }, data: productWriteData(merged) });
    revalidateTag("products");
    return NextResponse.json({ ok: true, product: toProduct(updated) });
  } catch (error) {
    return failure(error, "update");
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await findProduct(id, true);
    if (!product) return NextResponse.json({ ok: false, message: "Product not found" }, { status: 404 });
    await prisma.product.delete({ where: { id: product.id } });
    revalidateTag("products");
    return NextResponse.json({ ok: true, message: "Product deleted" });
  } catch (error) {
    return failure(error, "delete");
  }
}
