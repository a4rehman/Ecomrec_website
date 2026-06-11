"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Star, ZoomIn } from "lucide-react";
import { Product, products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, RootState, toggleWishlist, viewProduct } from "@/store/store";
import { ProductCard } from "./product-card";

export function ProductDetailClient({ product }: { product: Product }) {
  const [image, setImage] = useState(product.images[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const dispatch = useDispatch();
  const wished = useSelector((s: RootState) => s.commerce.wishlist.includes(product.id));
  useEffect(() => { dispatch(viewProduct(product.id)); }, [dispatch, product.id]);
  return (
    <section className="container-lux py-12">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div className="grid gap-4 md:grid-cols-[96px_1fr]">
          <div className="order-2 flex gap-3 md:order-1 md:flex-col">{product.images.map((src) => <button className="relative aspect-square w-24 overflow-hidden border border-line" onClick={() => setImage(src)} key={src}><Image src={src} alt={product.name} fill sizes="96px" className="object-cover" /></button>)}</div>
          <div className="relative order-1 aspect-[4/5] overflow-hidden bg-neutral-100 md:order-2"><Image src={image} alt={product.name} fill priority sizes="60vw" className="object-cover transition duration-500 hover:scale-110" /><span className="glass absolute bottom-5 right-5 flex items-center gap-2 px-4 py-3 text-sm"><ZoomIn size={16} /> Hover to zoom</span></div>
        </div>
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <p className="tracked-luxury text-xs text-accent">{product.category}</p>
          <h1 className="mt-3 font-serif text-5xl md:text-7xl">{product.name}</h1>
          <p className="mt-5 flex items-center gap-1"><Star size={16} fill="currentColor" /> {product.rating} · {product.reviews} reviews</p>
          <p className="mt-6 text-2xl font-semibold">{formatPrice(product.price)} {product.compareAt && <s className="ml-2 text-base text-muted">{formatPrice(product.compareAt)}</s>}</p>
          <p className="mt-6 leading-8 text-muted">{product.description}</p>
          <div className="mt-8"><p className="mb-3 tracked-luxury text-xs">Color</p><div className="flex flex-wrap gap-2">{product.colors.map((c) => <button key={c} onClick={() => setColor(c)} className={`border px-4 py-2 text-sm ${color === c ? "border-foreground" : "border-line"}`}>{c}</button>)}</div></div>
          <div className="mt-6"><p className="mb-3 tracked-luxury text-xs">Size</p><div className="flex flex-wrap gap-2">{product.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`min-w-12 border px-4 py-2 text-sm ${size === s ? "border-foreground bg-foreground text-background" : "border-line"}`}>{s}</button>)}</div></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]"><Button onClick={() => dispatch(addToCart({ id: product.id, qty: 1, size, color }))}>Add to Cart</Button><Button variant="outline" onClick={() => dispatch(toggleWishlist(product.id))}><Heart size={16} fill={wished ? "currentColor" : "none"} /> Wishlist</Button></div>
          <Button className="mt-3 w-full bg-accent border-accent text-white hover:bg-foreground" onClick={() => dispatch(addToCart({ id: product.id, qty: 1, size, color }))}>Buy Now</Button>
          <div className="mt-8 border-t border-line pt-6 text-sm leading-7 text-muted"><p>Fabric: {product.fabric}</p><p>Stock: {product.stock} available</p><p>Shipping: 2-4 business days</p></div>
        </div>
      </div>
      <section className="mt-20"><h2 className="font-serif text-5xl">Related Products</h2><div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{products.filter((p) => p.id !== product.id).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
    </section>
  );
}
