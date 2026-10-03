"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { openCartDrawer } from "@/store/store";

export interface AddedToastData {
  id: string;
  name: string;
  image?: string;
  price?: number;
  size?: string;
  color?: string;
}

/**
 * Global helper to trigger the "Added to Bag" toast from anywhere
 */
export function triggerCartToast(data: AddedToastData) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("sawera:cart-added", {
        detail: data,
      })
    );
  }
}

export function CartToast() {
  const [toast, setToast] = useState<AddedToastData | null>(null);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleAdded = (e: Event) => {
      const customEvent = e as CustomEvent<AddedToastData>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
        setVisible(true);

        clearTimeout(timer);
        timer = setTimeout(() => {
          setVisible(false);
        }, 3800);
      }
    };

    window.addEventListener("sawera:cart-added", handleAdded);
    return () => {
      window.removeEventListener("sawera:cart-added", handleAdded);
      clearTimeout(timer);
    };
  }, []);

  if (!toast || !visible) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-3 rounded-xl border border-line bg-background/95 p-3 sm:p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 max-w-[calc(100vw-32px)] sm:max-w-md pointer-events-auto"
      style={{
        paddingTop: "max(12px, env(safe-area-inset-top, 12px))",
      }}
    >
      {/* Product Image Thumbnail */}
      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded border border-line bg-neutral-100">
        <Image
          src={toast.image || "/images/hero_lawn.png"}
          alt={toast.name}
          fill
          sizes="40px"
          className="object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/hero_lawn.png";
          }}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <Check size={14} className="stroke-[2.5]" />
          <span>Added to Bag</span>
        </p>
        <p className="font-serif text-xs sm:text-sm font-medium text-foreground truncate mt-0.5">
          {toast.name}
        </p>
        {(toast.size || toast.color) && (
          <p className="text-[10px] text-muted truncate">
            {[toast.color, toast.size].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>

      {/* Action: Open Bag */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        <button
          onClick={() => {
            setVisible(false);
            dispatch(openCartDrawer());
          }}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-foreground transition-colors"
        >
          View Bag
        </button>

        <button
          onClick={() => setVisible(false)}
          className="rounded-full p-1 text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground transition"
          aria-label="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
