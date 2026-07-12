"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, RootState, toggleWishlist, openCartDrawer } from "@/store/store";

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const wished = useSelector((s: RootState) => s.commerce.wishlist.includes(product.id));
  const addProduct = () => {
    dispatch(addToCart({ id: product.id, qty: 1, size: product.sizes[0], color: product.colors[0] }));
    dispatch(openCartDrawer());
  };

  return (
    <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="group">
      <div className="relative overflow-hidden bg-[#f5f1ee]">
        <Link href={`/product/${product.slug}`} className="block aspect-[3/4] focus-ring">
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw" className="object-cover transition duration-700 ease-out group-hover:scale-105" />
        </Link>
        {product.badge && <span className="absolute left-3 top-3 bg-background/92 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.18em] shadow-sm">{product.badge}</span>}
        <button className="focus-ring absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/92 shadow-sm transition hover:bg-foreground hover:text-background" onClick={() => dispatch(toggleWishlist(product.id))} aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}><Heart size={18} strokeWidth={1.6} fill={wished ? "currentColor" : "none"} /></button>
        <button className="focus-ring absolute inset-x-3 bottom-3 hidden min-h-11 items-center justify-center gap-2 bg-background/94 px-4 text-[10px] font-semibold uppercase tracking-[.16em] shadow-sm transition hover:bg-foreground hover:text-background md:flex" onClick={addProduct} aria-label={`Add ${product.name} to cart`}><ShoppingBag size={16} strokeWidth={1.6} /> Add to bag</button>
      </div>
      <div className="flex items-start justify-between gap-3 py-4">
        <div>
          <Link href={`/product/${product.slug}`} className="focus-ring font-medium leading-6 transition hover:text-accent">{product.name}</Link>
          <p className="mt-1 text-xs uppercase tracking-[.12em] text-muted">{product.category}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Star size={13} fill="currentColor" className="text-accent" /> {product.rating} <span aria-hidden="true">·</span> {product.reviews} reviews</p>
          <p className="mt-2 font-semibold">{formatPrice(product.price)}{product.compareAt && <s className="ml-2 text-sm font-normal text-muted">{formatPrice(product.compareAt)}</s>}</p>
        </div>
        <div className="flex shrink-0 gap-1 md:hidden"><button className="focus-ring grid h-10 w-10 place-items-center border border-line" onClick={addProduct} aria-label={`Add ${product.name} to cart`}><ShoppingBag size={18} strokeWidth={1.6} /></button></div>
      </div>
    </motion.article>
  );
}