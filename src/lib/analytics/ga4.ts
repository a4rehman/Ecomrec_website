/**
 * Google Analytics 4 (GA4) Client-side Helper
 * Measurement ID: G-7XT36T2GJG
 */

import type { Product } from "@/data/products";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-7XT36T2GJG";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Safe gtag wrapper — never throws, no-ops if not in browser or not configured.
 */
export function gtag(...args: any[]) {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag(...args);
  } catch (err) {
    // Analytics failure must never break the client
    console.debug("[ga4] Tracking error:", err);
  }
}

/**
 * 1. Standard Page View
 */
export function gtagPageView(pagePath: string, pageTitle?: string) {
  gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle || (typeof document !== "undefined" ? document.title : ""),
    send_to: GA_MEASUREMENT_ID,
  });
}

/**
 * 2. View Item (Product Details)
 */
export function gtagViewItem(product: Product) {
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  gtag("event", "view_item", {
    currency: "PKR",
    value: price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand || "Sawera Collection",
        price,
        quantity: 1,
      },
    ],
  });
}

/**
 * 3. Add to Cart
 */
export function gtagAddToCart(
  product: Product,
  quantity = 1,
  size?: string,
  color?: string
) {
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  gtag("event", "add_to_cart", {
    currency: "PKR",
    value: price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand || "Sawera Collection",
        item_variant: [color, size].filter(Boolean).join(" / "),
        price,
        quantity,
      },
    ],
  });
}

/**
 * 4. Remove from Cart
 */
export function gtagRemoveFromCart(
  product: { id: string; name?: string; price?: number; category?: string },
  quantity = 1
) {
  gtag("event", "remove_from_cart", {
    currency: "PKR",
    value: (product.price || 0) * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name || "Product",
        item_category: product.category,
        price: product.price || 0,
        quantity,
      },
    ],
  });
}

/**
 * 5. View Cart
 */
export function gtagViewCart(value: number, items: Array<{ id: string; name: string; price: number; qty: number }>) {
  gtag("event", "view_cart", {
    currency: "PKR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.qty,
    })),
  });
}

/**
 * 6. Begin Checkout
 */
export function gtagBeginCheckout(
  value: number,
  items: Array<{ id: string; name: string; price: number; qty: number }>
) {
  gtag("event", "begin_checkout", {
    currency: "PKR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.qty,
    })),
  });
}

/**
 * 7. Purchase
 */
export function gtagPurchase(
  order: { id: string; total: number },
  items: Array<{ id: string; name: string; price: number; qty: number }>
) {
  gtag("event", "purchase", {
    transaction_id: order.id,
    value: order.total,
    currency: "PKR",
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.qty,
    })),
  });
}

/**
 * 8. Custom Interactions (Chatbot, Social, Filter, Search, Newsletter)
 */
export function gtagCustomEvent(eventName: string, params: Record<string, any> = {}) {
  gtag("event", eventName, params);
}
