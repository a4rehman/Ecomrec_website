"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Tag, Check, X, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { formatPrice } from "@/lib/utils";
import { removeFromCart, RootState, updateQty, applyCoupon, removeCoupon } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CartClient({ checkout = false }: { checkout?: boolean }) {
  const dispatch = useDispatch();
  const { cart, products, coupon } = useSelector((s: RootState) => s.commerce);
  
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; error: boolean } | null>(null);

  const lines = cart
    .map((line) => ({ ...line, product: products.find((p) => p.id === line.id)! }))
    .filter((l) => l.product);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const discountAmount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;
  const shipping = 0; // Free Nationwide Shipping across Pakistan
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();

      if (data.ok) {
        dispatch(applyCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
          description: data.description
        }));
        setCouponMessage({ text: data.message, error: false });
        setCouponInput("");
      } else {
        setCouponMessage({ text: data.message || "Invalid coupon code.", error: true });
      }
    } catch (err) {
      setCouponMessage({ text: "Failed to validate coupon. Please try again.", error: true });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponMessage(null);
  };

  if (!lines.length) {
    return (
      <section className="container-lux py-24 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <Tag size={28} />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl mb-3">Your Bag Is Empty</h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Discover our latest luxury lawn, festive formals, and everyday collections.
        </p>
        <Link href="/shop">
          <Button className="px-8 py-3.5">
            Explore Collections <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      {/* Items List */}
      <div className="space-y-6">
        {lines.map((l) => (
          <div
            className="flex gap-4 sm:gap-6 border-b border-line pb-6"
            key={`${l.id}-${l.size}-${l.color}`}
          >
            <div className="relative h-32 w-24 sm:h-36 sm:w-28 flex-shrink-0 overflow-hidden rounded bg-panel">
              <Image
                src={l.product.images[0] || "/images/hero_lawn.png"}
                alt={l.product.name}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base sm:text-lg font-medium text-foreground">
                    <Link href={`/product/${l.product.slug}`} className="hover:text-accent transition">
                      {l.product.name}
                    </Link>
                  </h3>
                  <button
                    onClick={() => dispatch(removeFromCart({ id: l.id, size: l.size, color: l.color }))}
                    className="text-muted hover:text-red-600 transition p-1"
                    title="Remove item"
                    aria-label={`Remove ${l.product.name} from bag`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <p className="mt-1 text-xs text-muted">
                  {l.color && <span>{l.color}</span>}
                  {l.color && l.size && <span> / </span>}
                  {l.size && <span className="font-medium text-foreground">{l.size}</span>}
                </p>
                
                <p className="mt-2 text-sm font-semibold text-accent">
                  {formatPrice(l.product.price)}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mt-4">
                <div className="inline-flex items-center border border-line rounded">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-muted hover:text-foreground hover:bg-panel transition"
                    onClick={() => dispatch(updateQty({ id: l.id, size: l.size, color: l.color, qty: l.qty - 1 }))}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-medium">{l.qty}</span>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-muted hover:text-foreground hover:bg-panel transition"
                    onClick={() => dispatch(updateQty({ id: l.id, size: l.size, color: l.color, qty: l.qty + 1 }))}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs text-muted ml-auto font-medium">
                  Line Total: {formatPrice(l.product.price * l.qty)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Sidebar */}
      <aside className="glass h-fit p-6 rounded-lg border border-line space-y-6">
        <h2 className="tracked-luxury text-sm font-semibold border-b border-line pb-4">
          Order Summary
        </h2>

        {/* Coupon Form */}
        <div>
          {coupon ? (
            <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded text-xs">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-accent" />
                <span>
                  <b className="uppercase">{coupon.code}</b> ({coupon.discountPercent}% OFF)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-muted hover:text-red-600 transition"
                title="Remove coupon"
                aria-label="Remove coupon"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <Input
                placeholder="Coupon (e.g. SAWERA15)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="h-10 text-xs uppercase"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={couponLoading || !couponInput.trim()}
                className="h-10 px-4 text-xs shrink-0"
              >
                {couponLoading ? "Applying..." : "Apply"}
              </Button>
            </form>
          )}

          {couponMessage && (
            <p className={`mt-2 text-xs ${couponMessage.error ? "text-red-600" : "text-green-600 font-medium"}`}>
              {couponMessage.text}
            </p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 text-sm">
          <p className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
          </p>
          
          {discountAmount > 0 && (
            <p className="flex justify-between text-accent font-medium">
              <span>Coupon Discount ({coupon?.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </p>
          )}

          <p className="flex justify-between text-muted">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">FREE (Nationwide)</span>
          </p>

          <div className="flex justify-between border-t border-line pt-4 text-lg font-serif font-bold text-foreground">
            <span>Total</span>
            <span className="text-accent">{formatPrice(total)}</span>
          </div>
        </div>

        {!checkout && (
          <Link href="/checkout" className="block w-full">
            <Button className="w-full py-4 text-sm font-semibold tracking-wider uppercase">
              Proceed to Checkout <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        )}

        {/* Badges */}
        <div className="border-t border-line pt-4 space-y-2 text-[11px] text-muted">
          <p className="flex items-center gap-2">
            <Truck size={14} className="text-accent shrink-0" /> Free express delivery across Pakistan (2-4 business days)
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-accent shrink-0" /> Cash on Delivery available at your doorstep
          </p>
        </div>
      </aside>
    </div>
  );
}
