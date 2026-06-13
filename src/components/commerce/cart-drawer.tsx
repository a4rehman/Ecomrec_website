"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { closeCartDrawer, removeFromCart, RootState, updateQty } from "@/store/store";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cart, cartDrawerOpen, user } = useSelector((s: RootState) => s.commerce);

  const lines = cart
    .map((line) => ({ ...line, product: products.find((p) => p.id === line.id)! }))
    .filter((l) => l.product);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [cartDrawerOpen]);

  if (!cartDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(closeCartDrawer())}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
          cartDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-xl font-medium">Your Bag</h2>
          <button
            onClick={() => dispatch(closeCartDrawer())}
            className="p-2 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!lines.length ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-muted">Your bag is currently empty.</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => dispatch(closeCartDrawer())}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {lines.map((l) => (
                <div
                  key={`${l.id}-${l.size}-${l.color}`}
                  className="flex gap-4"
                >
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-neutral-100">
                    <Image
                      src={l.product.images[0]}
                      alt={l.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{l.product.name}</h3>
                      <button
                        onClick={() => dispatch(removeFromCart(l.id))}
                        className="text-muted hover:text-black"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {l.color} / {l.size}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {formatPrice(l.product.price)}
                    </p>
                    <div className="mt-auto flex items-center">
                      <div className="flex items-center border border-line">
                        <button
                          className="px-2 py-1 text-muted transition hover:bg-neutral-100 hover:text-black"
                          onClick={() => dispatch(updateQty({ id: l.id, qty: l.qty - 1 }))}
                        >
                          -
                        </button>
                        <span className="px-2 text-sm">{l.qty}</span>
                        <button
                          className="px-2 py-1 text-muted transition hover:bg-neutral-100 hover:text-black"
                          onClick={() => dispatch(updateQty({ id: l.id, qty: l.qty + 1 }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="border-t border-line bg-neutral-50 px-6 py-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Shipping, taxes, and discounts calculated at checkout.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/cart" passHref onClick={() => dispatch(closeCartDrawer())}>
                <Button variant="outline" className="w-full">
                  Go to Cart
                </Button>
              </Link>
              <Button
                className="w-full"
                onClick={() => {
                  dispatch(closeCartDrawer());
                  if (user) {
                    router.push("/checkout");
                  } else {
                    router.push("/login?redirect=/checkout");
                  }
                }}
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
