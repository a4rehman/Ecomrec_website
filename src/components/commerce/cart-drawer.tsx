"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { formatPrice } from "@/lib/utils";
import { closeCartDrawer, removeFromCart, RootState, updateQty } from "@/store/store";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cart, cartDrawerOpen, products } = useSelector((s: RootState) => s.commerce);

  const lines = cart
    .map((line) => ({ ...line, product: products.find((p) => p.id === line.id)! }))
    .filter((l) => l.product);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const freeShippingThreshold = 3000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  if (!cartDrawerOpen) return null;

  return (
    <div
      aria-label="Shopping Bag Drawer"
      className="fixed inset-y-0 right-0 z-50 flex w-full sm:w-[420px] max-w-full flex-col bg-background/98 backdrop-blur-xl border-l border-line shadow-2xl transition-transform duration-300 ease-in-out animate-in slide-in-from-right"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-panel/70">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-accent" />
          <h2 className="font-serif text-lg sm:text-xl font-medium">Your Bag</h2>
          <span className="ml-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
            {lines.reduce((acc, l) => acc + l.qty, 0)}
          </span>
        </div>

        <button
          onClick={() => dispatch(closeCartDrawer())}
          className="rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted hover:text-foreground"
          aria-label="Close cart drawer"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Free Shipping Banner */}
      <div className="border-b border-line bg-blush/40 px-5 py-3 text-xs">
        {subtotal >= freeShippingThreshold ? (
          <p className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
            <Check size={14} className="shrink-0" />
            <span>🎉 You qualify for <strong>FREE Delivery</strong> across Pakistan!</span>
          </p>
        ) : (
          <div>
            <p className="flex items-center gap-1.5 text-muted">
              <Truck size={14} className="shrink-0 text-accent" />
              <span>Add <strong>{formatPrice(amountNeeded)}</strong> more to get <strong>FREE Delivery</strong></span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-accent transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-line/60">
        {!lines.length ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-serif text-lg font-medium text-foreground">Your bag is empty</h3>
            <p className="mt-1 text-xs text-muted max-w-xs leading-relaxed">
              Explore our handcrafted Luxury Lawn and Festive Chiffon collections.
            </p>
            <Button
              variant="outline"
              className="mt-6 text-xs uppercase tracking-wider"
              onClick={() => dispatch(closeCartDrawer())}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {lines.map((l) => (
              <div
                key={`${l.id}-${l.size || "std"}-${l.color || "std"}`}
                className="flex gap-3.5 pt-4 first:pt-0"
              >
                {/* Product Thumbnail */}
                <Link
                  href={`/product/${l.product.slug}`}
                  onClick={() => dispatch(closeCartDrawer())}
                  className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded border border-line bg-neutral-100"
                >
                  <Image
                    src={l.product.images?.[0] || "/images/hero_lawn.png"}
                    alt={l.product.name}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/hero_lawn.png";
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${l.product.slug}`}
                        onClick={() => dispatch(closeCartDrawer())}
                        className="font-medium text-xs sm:text-sm line-clamp-1 hover:text-accent transition-colors"
                      >
                        {l.product.name}
                      </Link>
                      <button
                        onClick={() => dispatch(removeFromCart({ id: l.id, size: l.size, color: l.color }))}
                        className="text-muted hover:text-red-500 transition-colors p-1"
                        aria-label={`Remove ${l.product.name} from bag`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      {l.color && <span>Color: {l.color}</span>}
                      {l.color && l.size && <span>•</span>}
                      {l.size && <span>Size: {l.size}</span>}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded border border-line bg-background">
                      <button
                        className="px-2.5 py-1 text-xs text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground transition disabled:opacity-40"
                        onClick={() => dispatch(updateQty({ id: l.id, size: l.size, color: l.color, qty: l.qty - 1 }))}
                        disabled={l.qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold">{l.qty}</span>
                      <button
                        className="px-2.5 py-1 text-xs text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground transition"
                        onClick={() => dispatch(updateQty({ id: l.id, size: l.size, color: l.color, qty: l.qty + 1 }))}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {formatPrice(l.product.price * l.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Checkout Actions */}
      {lines.length > 0 && (
        <div className="border-t border-line bg-panel/90 px-5 py-4">
          <div className="flex items-center justify-between text-sm sm:text-base font-semibold">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Taxes &amp; shipping calculated at checkout.
          </p>

          <div className="mt-4 grid gap-2.5">
            <Button
              className="w-full bg-foreground text-background hover:bg-accent hover:text-white py-3 font-medium text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              onClick={() => {
                dispatch(closeCartDrawer());
                router.push("/checkout");
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </Button>

            <div className="flex items-center gap-2">
              <Link href="/cart" passHref onClick={() => dispatch(closeCartDrawer())} className="flex-1">
                <Button variant="outline" className="w-full text-xs uppercase tracking-wider">
                  View Bag
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="flex-1 text-xs uppercase tracking-wider text-muted hover:text-foreground"
                onClick={() => dispatch(closeCartDrawer())}
              >
                Keep Browsing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

