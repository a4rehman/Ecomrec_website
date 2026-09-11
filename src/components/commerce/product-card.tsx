"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { productImageAlt } from "@/lib/seo";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, RootState, toggleWishlist, openCartDrawer } from "@/store/store";

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const wished = useSelector((s: RootState) => s.commerce.wishlist.includes(product.id));
  const nextImage = product.images[1];
  const addProduct = () => {
    dispatch(addToCart({ id: product.id, qty: 1, size: product.sizes[0], color: product.colors[0] }));
    dispatch(openCartDrawer());
  };

  return (
    <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="group min-w-0">
      <div className="relative overflow-hidden bg-[#f5f1ee] aspect-[3/4] w-full">
        <Link href={`/product/${product.slug}`} className="block w-full h-full focus-ring">
          <Image src={product.images[0]} alt={productImageAlt(product)} fill sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw" className={`object-cover transition duration-700 ease-out ${nextImage ? "group-hover:scale-105 group-hover:opacity-0" : "group-hover:scale-105"}`} />
          {nextImage && <>
            <Image src={nextImage} alt={`${product.name} alternate view`} fill sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw" className="object-cover opacity-0 scale-105 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100" />
            <span className="pointer-events-none absolute bottom-3 left-3 translate-y-2 bg-background/92 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.16em] opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">Next view</span>
          </>}
        </Link>
        {product.badge && <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 bg-background/92 px-2.5 py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-[.18em] shadow-sm">{product.badge}</span>}
        <button className="focus-ring absolute right-2.5 top-2.5 sm:right-3 sm:top-3 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-background/92 shadow-sm transition hover:bg-foreground hover:text-background" onClick={() => dispatch(toggleWishlist(product.id))} aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}><Heart size={16} className="sm:size-[18px]" strokeWidth={1.6} fill={wished ? "currentColor" : "none"} /></button>
        <button className="focus-ring absolute inset-x-3 bottom-3 hidden min-h-11 items-center justify-center gap-2 bg-background/94 px-4 text-[10px] font-semibold uppercase tracking-[.16em] shadow-sm transition hover:bg-foreground hover:text-background md:flex" onClick={addProduct} aria-label={`Add ${product.name} to cart`}><ShoppingBag size={16} strokeWidth={1.6} /> Add to bag</button>
      </div>
      <div className="flex items-start justify-between gap-2 sm:gap-3 py-3 sm:py-4 min-w-0">
        <div className="min-w-0 flex-1">
          <Link href={`/product/${product.slug}`} className="focus-ring font-medium text-xs sm:text-sm sm:leading-6 line-clamp-2 transition hover:text-accent break-words">{product.name}</Link>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs uppercase tracking-[.12em] text-muted truncate">{product.category}</p>

          {product.salePrice && product.saleEnd ? (
            <div className="mt-1.5 sm:mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm line-through text-muted">{formatPrice(product.price)}</span>
              <span className="text-xs sm:text-base font-semibold text-accent">{formatPrice(product.salePrice)}</span>
            </div>
          ) : (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base font-semibold">{formatPrice(product.price)}{product.compareAt && <s className="ml-1.5 sm:ml-2 text-[10px] sm:text-sm font-normal text-muted">{formatPrice(product.compareAt)}</s>}</p>
          )}
          {product.saleEnd && <CountdownTimer endDate={product.saleEnd} size="sm" />}
        </div>
        <div className="flex shrink-0 gap-1 md:hidden"><button className="focus-ring grid h-8 w-8 sm:h-10 sm:w-10 place-items-center border border-line" onClick={addProduct} aria-label={`Add ${product.name} to cart`}><ShoppingBag size={15} strokeWidth={1.6} /></button></div>
      </div>
    </motion.article>
  );
}
