"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { removeFromCart, RootState, updateQty } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CartClient({ checkout = false }: { checkout?: boolean }) {
  const dispatch = useDispatch();
  const cart = useSelector((s: RootState) => s.commerce.cart);
  const lines = cart.map((line) => ({ ...line, product: products.find((p) => p.id === line.id)! })).filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const discount = subtotal > 250 ? subtotal * 0.1 : 0;
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;
  if (!lines.length) return <section className="container-lux py-20 text-center"><h1 className="font-serif text-6xl">Your Bag Is Empty</h1><Link href="/shop"><Button className="mt-8">Start Shopping</Button></Link></section>;
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">{lines.map((l) => <div className="grid grid-cols-[96px_1fr_auto] gap-4 border-b border-line pb-5" key={`${l.id}-${l.size}-${l.color}`}><div className="relative aspect-[3/4] overflow-hidden"><Image src={l.product.images[0]} alt={l.product.name} fill sizes="96px" className="object-cover" /></div><div><h3 className="font-medium">{l.product.name}</h3><p className="mt-1 text-sm text-muted">{l.color} / {l.size}</p><p className="mt-2">{formatPrice(l.product.price)}</p><input type="number" min={1} value={l.qty} onChange={(e) => dispatch(updateQty({ id: l.id, qty: Number(e.target.value) }))} className="mt-4 h-10 w-20 border border-line bg-transparent px-3" /></div><button onClick={() => dispatch(removeFromCart(l.id))} className="self-start"><Trash2 size={18} /></button></div>)}</div>
      <aside className="glass h-fit p-6"><h2 className="tracked-luxury mb-5 text-sm">Order Summary</h2><Input placeholder="Coupon code" /><div className="mt-6 space-y-3 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p><p className="flex justify-between"><span>Coupon</span><span>-{formatPrice(discount)}</span></p><p className="flex justify-between"><span>Shipping</span><span>{shipping ? formatPrice(shipping) : "Free"}</span></p><p className="flex justify-between"><span>Tax</span><span>{formatPrice(tax)}</span></p><p className="flex justify-between border-t border-line pt-4 text-lg font-semibold"><span>Total</span><span>{formatPrice(total)}</span></p></div>{!checkout && <Link href="/checkout"><Button className="mt-6 w-full">Checkout</Button></Link>}</aside>
    </div>
  );
}
