/**
 * Sawera Collection Unified Analytics Master Engine
 * Centralizes GA4, Clarity, Meta Pixel, and Internal Session Intelligence.
 */

import type { Product } from "@/data/products";
import {
  gtagPageView,
  gtagViewItem,
  gtagAddToCart,
  gtagRemoveFromCart,
  gtagViewCart,
  gtagBeginCheckout,
  gtagPurchase,
  gtagCustomEvent,
} from "./ga4";
import { clarityEvent, claritySetTag } from "./clarity";
import { sendAnalyticsEvent, getOrCreateSessionId } from "./session-tracker";

export { getOrCreateSessionId };

/**
 * 1. Page Journey Transition
 */
export function trackPageView(path: string, pageTitle?: string) {
  gtagPageView(path, pageTitle);
  sendAnalyticsEvent("PAGE_VIEW", { path, pageTitle });
}

/**
 * 2. Product Detail View
 */
export function trackProductView(product: Product) {
  gtagViewItem(product);
  clarityEvent("view_product");
  sendAnalyticsEvent("PRODUCT_VIEW", {
    path: `/product/${product.slug}`,
    productId: product.id,
    productName: product.name,
    metadata: {
      category: product.category,
      price: product.salePrice || product.price,
      sku: product.sku,
    },
  });
}

/**
 * 3. Add to Bag
 */
export function trackAddToCart(
  product: Product,
  quantity = 1,
  size?: string,
  color?: string
) {
  gtagAddToCart(product, quantity, size, color);
  clarityEvent("add_to_cart");
  sendAnalyticsEvent("ADD_TO_CART", {
    path: `/product/${product.slug}`,
    productId: product.id,
    productName: product.name,
    metadata: {
      price: (product.salePrice || product.price) * quantity,
      quantity,
      size,
      color,
    },
  });
}

/**
 * 4. Remove from Bag
 */
export function trackRemoveFromCart(
  product: { id: string; name?: string; price?: number },
  quantity = 1
) {
  gtagRemoveFromCart(product, quantity);
  sendAnalyticsEvent("REMOVE_FROM_CART", {
    productId: product.id,
    productName: product.name,
    metadata: { quantity },
  });
}

/**
 * 5. View Bag / Cart Drawer Open
 */
export function trackViewCart(
  total: number,
  items: Array<{ id: string; name: string; price: number; qty: number }>
) {
  gtagViewCart(total, items);
  sendAnalyticsEvent("VIEW_CART", {
    metadata: { total, itemCount: items.reduce((acc, i) => acc + i.qty, 0) },
  });
}

/**
 * 6. Begin Checkout
 */
export function trackBeginCheckout(
  total: number,
  items: Array<{ id: string; name: string; price: number; qty: number }>
) {
  gtagBeginCheckout(total, items);
  clarityEvent("begin_checkout");
  sendAnalyticsEvent("BEGIN_CHECKOUT", {
    path: "/checkout",
    metadata: { total, itemCount: items.length },
  });
}

/**
 * 7. Purchase Completed
 */
export function trackPurchase(
  order: { id: string; total: number },
  items: Array<{ id: string; name: string; price: number; qty: number }>
) {
  gtagPurchase(order, items);
  clarityEvent("purchase_completed");
  claritySetTag("order_id", order.id);
  sendAnalyticsEvent("PURCHASE", {
    path: "/checkout",
    metadata: { orderId: order.id, total: order.total, itemCount: items.length },
  });
}

/**
 * 8. Chatbot Interaction Tracking
 */
export function trackChatbot(action: "OPEN" | "CLOSE" | "INTERACT") {
  const eventName = action === "OPEN" ? "CHATBOT_OPEN" : action === "CLOSE" ? "CHATBOT_CLOSE" : "CHATBOT_INTERACTION";
  gtagCustomEvent(eventName.toLowerCase());
  sendAnalyticsEvent(eventName);
}

/**
 * 9. Social Media Link Clicks
 */
export function trackSocialClick(platform: "instagram" | "facebook" | "whatsapp") {
  const eventName = `${platform.toUpperCase()}_CLICK`;
  gtagCustomEvent(eventName.toLowerCase(), { platform });
  sendAnalyticsEvent(eventName, { metadata: { platform } });
}

/**
 * 10. Search & Filter Activity
 */
export function trackSearch(query: string) {
  if (!query.trim()) return;
  gtagCustomEvent("search", { search_term: query });
  sendAnalyticsEvent("SEARCH", { metadata: { query } });
}

export function trackFilter(filterCategory: string, value: string) {
  gtagCustomEvent("filter_used", { filter_type: filterCategory, value });
  sendAnalyticsEvent("FILTER_USED", { metadata: { filterCategory, value } });
}

/**
 * 11. Newsletter Signup
 */
export function trackNewsletterSignup() {
  gtagCustomEvent("newsletter_signup");
  sendAnalyticsEvent("NEWSLETTER_SIGNUP");
}
