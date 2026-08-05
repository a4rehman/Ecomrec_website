"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { productImageAlt } from "@/lib/seo";

export function ProductStrip({
  products,
  showFabric = false,
}: {
  products: Product[];
  showFabric?: boolean;
}) {
  if (!products.length) return null;

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
      <div className="flex min-w-max gap-4 md:min-w-0 md:grid md:grid-cols-4 lg:grid-cols-6">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            className="w-44 shrink-0 md:w-auto"
          >
            <Link href={`/product/${product.slug}`} className="group block">
              <div className="lux-sheen relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
                <Image
                  src={product.images[0]}
                  alt={productImageAlt(product)}
                  fill
                  sizes="(max-width:768px) 176px, 220px"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                {product.badge === "Express" && (
                  <span className="absolute bottom-3 right-3 flex overflow-hidden rounded text-[8px] font-bold uppercase tracking-wider shadow-md">
                    <span className="bg-accent px-2 py-1 text-white">Express</span>
                    <span className="bg-foreground px-2 py-1 italic text-background">Shipping</span>
                  </span>
                )}
                {product.badge && product.badge !== "Express" && (
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-3 line-clamp-2 text-center text-sm font-semibold leading-snug transition group-hover:text-accent">
                {product.name}
              </h3>
              {showFabric && (
                <p className="mt-1 text-center text-xs text-muted">{product.fabric}</p>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
