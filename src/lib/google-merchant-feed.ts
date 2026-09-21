import { prisma } from "@/lib/db";
import { toProduct } from "@/lib/product-service";
import { SITE_URL } from "@/lib/seo";
import type { Product } from "@/data/products";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanText(text: string): string {
  return text.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

function resolveImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${SITE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

async function getPublishedProducts(): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "published", isActive: true },
      orderBy: { createdAt: "desc" }
    });
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(toProduct);
    }
  } catch {
    // Database fallback
  }

  const { products: staticCatalog } = await import("@/data/products");
  return staticCatalog.filter((p) => p.status !== "draft" && p.isActive !== false);
}

export async function generateGoogleShoppingXml(): Promise<string> {
  const products = await getPublishedProducts();
  const eligibleProducts = products.filter(
    (p) => p.status !== "draft" && p.isActive !== false && p.price > 0
  );

  const itemsXml = eligibleProducts
    .map((product) => {
      const productUrl = `${SITE_URL}/product/${product.slug}`;
      const safeImages = product.images
        .filter((img) => !img.startsWith("data:"))
        .map(resolveImageUrl);

      const mainImage = safeImages[0] || `${SITE_URL}/images/hero_lawn.png`;
      const additionalImages = safeImages.slice(1, 10);

      const hasSale =
        typeof product.salePrice === "number" &&
        product.salePrice > 0 &&
        product.salePrice < product.price;

      const regularPrice = hasSale
        ? `${product.price.toFixed(2)} PKR`
        : `${product.price.toFixed(2)} PKR`;
      const salePrice = hasSale ? `${(product.salePrice as number).toFixed(2)} PKR` : null;

      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
      const brand = product.brand || "Sawera Collection";
      const productType = `Apparel & Accessories > Clothing > Women's Clothing > Pakistani Suits > ${product.category}`;

      const rawDescription =
        product.description || `${product.name} - Premium Pakistani Women's Suit by Sawera Collection.`;
      const description = escapeXml(cleanText(rawDescription));
      const title = escapeXml(cleanText(product.name));

      const color = product.colors?.[0] ? escapeXml(product.colors[0]) : null;
      const size = product.sizes?.length ? escapeXml(product.sizes.join("/")) : "Unstitched";
      const material = product.fabric ? escapeXml(cleanText(product.fabric)) : "Lawn";

      return `    <item>
      <g:id>${escapeXml(product.id || product.slug)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
${additionalImages.map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join("\n")}
      <g:availability>${availability}</g:availability>
      <g:price>${regularPrice}</g:price>
${salePrice ? `      <g:sale_price>${salePrice}</g:sale_price>\n` : ""}      <g:condition>new</g:condition>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:identifier_exists>${product.sku ? "yes" : "no"}</g:identifier_exists>
${product.sku ? `      <g:mpn>${escapeXml(product.sku)}</g:mpn>\n` : ""}      <g:google_product_category>1604</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
${color ? `      <g:color>${color}</g:color>\n` : ""}      <g:size>${size}</g:size>
      <g:material>${material}</g:material>
      <g:shipping>
        <g:country>PK</g:country>
        <g:service>Standard Nationwide Delivery</g:service>
        <g:price>0.00 PKR</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Sawera Collection - Google Merchant Center Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Live product catalog for Sawera Collection women's suits and dresses</description>
${itemsXml}
  </channel>
</rss>`;
}

export async function generateGoogleShoppingTsv(): Promise<string> {
  const products = await getPublishedProducts();
  const eligibleProducts = products.filter(
    (p) => p.status !== "draft" && p.isActive !== false && p.price > 0
  );

  const headers = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "additional_image_link",
    "availability",
    "price",
    "sale_price",
    "condition",
    "brand",
    "identifier_exists",
    "mpn",
    "google_product_category",
    "product_type",
    "color",
    "size",
    "material",
    "shipping"
  ];

  const rows = eligibleProducts.map((product) => {
    const productUrl = `${SITE_URL}/product/${product.slug}`;
    const safeImages = product.images
      .filter((img) => !img.startsWith("data:"))
      .map(resolveImageUrl);

    const mainImage = safeImages[0] || `${SITE_URL}/images/hero_lawn.png`;
    const additionalImages = safeImages.slice(1, 10).join(",");

    const hasSale =
      typeof product.salePrice === "number" &&
      product.salePrice > 0 &&
      product.salePrice < product.price;

    const regularPrice = `${product.price.toFixed(2)} PKR`;
    const salePrice = hasSale ? `${(product.salePrice as number).toFixed(2)} PKR` : "";

    const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
    const brand = product.brand || "Sawera Collection";
    const productType = `Apparel & Accessories > Clothing > Women's Clothing > Pakistani Suits > ${product.category}`;
    const description = cleanText(product.description || product.name);
    const title = cleanText(product.name);
    const color = product.colors?.[0] || "";
    const size = product.sizes?.length ? product.sizes.join("/") : "Unstitched";
    const material = product.fabric || "Lawn";
    const mpn = product.sku || "";
    const identifierExists = mpn ? "yes" : "no";
    const shipping = "PK:Standard Nationwide Delivery:0.00 PKR";

    return [
      product.id || product.slug,
      title,
      description,
      productUrl,
      mainImage,
      additionalImages,
      availability,
      regularPrice,
      salePrice,
      "new",
      brand,
      identifierExists,
      mpn,
      "1604",
      productType,
      color,
      size,
      material,
      shipping
    ]
      .map((val) => String(val).replace(/[\t\r\n]+/g, " "))
      .join("\t");
  });

  return [headers.join("\t"), ...rows].join("\n");
}
