import { PrismaClient } from "@prisma/client";
import { products } from "../src/data/products";

const prisma = new PrismaClient();

async function seedDefaultProducts() {
  let inserted = 0;
  let skipped = 0;

  for (const product of products) {
    // This import is deliberately non-destructive: products already entered
    // through the admin panel always win over the bundled catalog.
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.product.create({
      data: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        compareAt: product.compareAt ?? null,
        rating: product.rating,
        reviews: product.reviews,
        badge: product.badge ?? null,
        colors: JSON.stringify(product.colors),
        sizes: JSON.stringify(product.sizes),
        images: JSON.stringify(product.images),
        description: product.description,
        fabric: product.fabric,
        stock: product.stock,
        salePrice: product.salePrice ?? null,
        saleEnd: product.saleEnd ?? null,
        status: "published",
        isActive: true,
        publishedAt: new Date(),
      },
    });
    inserted += 1;
  }

  console.log(`Default catalog import complete: ${inserted} added, ${skipped} already present.`);
}

seedDefaultProducts()
  .catch((error) => {
    console.error("Default catalog import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
