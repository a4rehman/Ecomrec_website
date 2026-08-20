"use client";

import { useDispatch, useSelector } from "react-redux";
import { ProductCard } from "@/components/commerce/product-card";
import { RootState, addToCart } from "@/store/store";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { wishlist: ids, products } = useSelector((s: RootState) => s.commerce);
  const items = products.filter((p) => ids.includes(p.id));
  return <section className="container-lux py-14"><h1 className="mb-10 font-serif text-6xl">Wishlist</h1>{items.length ? <><div className="mb-6"><Button variant="outline" onClick={() => items.forEach((p) => dispatch(addToCart({ id: p.id, qty: 1, size: p.sizes[0], color: p.colors[0] })))}>Move All To Cart</Button></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div></> : <p className="text-muted">Saved products will appear here.</p>}</section>;
}
