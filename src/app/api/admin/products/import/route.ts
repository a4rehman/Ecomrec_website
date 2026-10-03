import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-session";
import { productWriteData, toProduct } from "@/lib/product-service";
import type { Product } from "@/data/products";

export const dynamic = "force-dynamic";

type ImportProduct = Partial<Product> & { name?: string; category?: string; price?: number | string };
type DuplicateMode = "skip" | "update";
const MAX_IMPORT_ROWS = 1000;

function cleanNumber(value: unknown, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanList(value: unknown) {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[;,|]/) : [];
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))];
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uniqueSlug(name: string, requested?: string, ignoreId?: string) {
  const base = slugify(requested || name) || `product-${Date.now()}`;
  let candidate = base;
  for (let suffix = 2; ; suffix += 1) {
    const found = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!found || found.id === ignoreId) return candidate;
    candidate = `${base}-${suffix}`;
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdminSession(request)) return NextResponse.json({ ok: false, message: "Administrator authentication is required. Please sign in again." }, { status: 401 });
  try {
    const body = await request.json() as { products?: ImportProduct[]; duplicateMode?: DuplicateMode };
    const rows = Array.isArray(body.products) ? body.products.slice(0, MAX_IMPORT_ROWS) : [];
    if (!rows.length) return NextResponse.json({ ok: false, message: "Select at least one valid CSV row." }, { status: 400 });
    const duplicateMode = body.duplicateMode === "update" ? "update" : "skip";
    const results: { row: number; name: string; status: "imported" | "updated" | "skipped" | "failed"; message?: string; product?: Product }[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const name = String(row.name || "").trim();
      const category = String(row.category || "").trim();
      const price = cleanNumber(row.price);
      if (!name || !category || price <= 0) {
        results.push({ row: index + 1, name: name || `Row ${index + 1}`, status: "failed", message: "Name, category, and a positive price are required." });
        continue;
      }
      try {
        const sku = String(row.sku || "").trim() || undefined;
        const existing = await prisma.product.findFirst({
          where: sku
            ? { OR: [{ sku }, { slug: slugify(row.slug || name) }, { name }] }
            : { OR: [{ slug: slugify(row.slug || name) }, { name }] },
        });
        if (existing && duplicateMode === "skip") {
          results.push({ row: index + 1, name, status: "skipped", message: "Product already exists (SKU, slug, or name)." });
          continue;
        }
        const status = row.status === "published" ? "published" : "draft";
        const normalized: Omit<Product, "id"> = {
          slug: await uniqueSlug(name, row.slug, existing?.id), name, category,
          brand: String(row.brand || "Sawera Collection").trim(), price,
          compareAt: cleanNumber(row.compareAt) || undefined, rating: cleanNumber(row.rating, 5), reviews: Math.max(0, Math.trunc(cleanNumber(row.reviews, 1))),
          badge: typeof row.badge === "string" && row.badge.trim() ? row.badge.trim() : undefined,
          colors: cleanList(row.colors), sizes: cleanList(row.sizes).length ? cleanList(row.sizes) : ["M", "L"], images: cleanList(row.images),
          description: String(row.description || name).trim(), fabric: String(row.fabric || "Pure Lawn").trim(), stock: Math.max(0, Math.trunc(cleanNumber(row.stock, 0))),
          salePrice: cleanNumber(row.salePrice) || undefined, saleEnd: typeof row.saleEnd === "string" ? row.saleEnd : undefined,
          status, isActive: status === "published", sku, tags: cleanList(row.tags),
        };
        const saved = existing ? await prisma.product.update({ where: { id: existing.id }, data: productWriteData(normalized) }) : await prisma.product.create({ data: productWriteData(normalized) });
        results.push({ row: index + 1, name, status: existing ? "updated" : "imported", product: toProduct(saved) });
      } catch (error) {
        console.error("CSV product import row failed", { row: index + 1, error });
        results.push({ row: index + 1, name, status: "failed", message: "Database save failed. This row was not imported." });
      }
    }
    if (results.some((result) => result.status === "imported" || result.status === "updated")) {
      revalidateTag("products");
      revalidatePath("/sitemap.xml");
    }
    const summary = { total: results.length, imported: results.filter((r) => r.status === "imported").length, updated: results.filter((r) => r.status === "updated").length, skipped: results.filter((r) => r.status === "skipped").length, failed: results.filter((r) => r.status === "failed").length };
    return NextResponse.json({ ok: true, summary, results });
  } catch (error) {
    console.error("CSV import request failed", error);
    return NextResponse.json({ ok: false, message: "Import could not be processed. No unconfirmed product has been counted as imported." }, { status: 500 });
  }
}
