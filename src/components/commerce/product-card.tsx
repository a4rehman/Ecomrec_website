"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, RootState, toggleWishlist } from "@/store/store";

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const wished = useSelector((s: RootState) => s.commerce.wishlist.includes(product.id));
  return (
    <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="group">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image src={product.images[0]} alt={product.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
        {product.badge && <span className="absolute left-4 top-4 bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[.22em]">{product.badge}</span>}
      </Link>
      <div className="flex items-start justify-between gap-3 py-4">
        <div>
          <Link href={`/product/${product.slug}`} className="font-medium">{product.name}</Link>
          <p className="mt-1 text-sm text-muted">{product.category}</p>
          <p className="mt-2 flex items-center gap-1 text-xs"><Star size={13} fill="currentColor" /> {product.rating} ({product.reviews})</p>
          <p className="mt-2 font-semibold">{formatPrice(product.price)} {product.compareAt && <s className="ml-2 text-sm font-normal text-muted">{formatPrice(product.compareAt)}</s>}</p>
        </div>
        <div className="flex gap-2">
          <button className="focus-ring" onClick={() => dispatch(toggleWishlist(product.id))} aria-label="Wishlist"><Heart size={20} fill={wished ? "currentColor" : "none"} /></button>
          <button className="focus-ring" onClick={() => dispatch(addToCart({ id: product.id, qty: 1, size: product.sizes[0], color: product.colors[0] }))} aria-label="Add to cart"><ShoppingBag size={20} /></button>
        </div>
      </div>
    </motion.article>
  );
}
