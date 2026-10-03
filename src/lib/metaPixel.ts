import type { Middleware } from "@reduxjs/toolkit";
import type { Product } from "@/data/products";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const CURRENCY = "PKR";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Safe fbq wrapper. No-ops on the server, when the SDK is not loaded yet,
 * or when the pixel is not configured — analytics must never break the app.
 */
function fbq(...args: any[]) {
  if (typeof window === "undefined" || !window.fbq || !META_PIXEL_ID) return;
  window.fbq(...args);
}

const productPrice = (product: Product) => (product.salePrice && product.salePrice > 0 ? product.salePrice : product.price);

/** Standard Meta `PageView` event. */
export function pageView() {
  fbq("track", "PageView");
}

/** Standard Meta `ViewContent` event (product page). */
export function viewContent(product: Product) {
  fbq("track", "ViewContent", {
    content_type: "product",
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    value: productPrice(product),
    currency: CURRENCY
  });
}

/** Standard Meta `AddToCart` event. */
export function addToCart(product: Product, quantity = 1) {
  fbq("track", "AddToCart", {
    content_type: "product",
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    value: productPrice(product) * quantity,
    currency: CURRENCY,
    num_items: quantity
  });
}

/** Standard Meta `AddToWishlist` event. */
export function addToWishlist(product: Product) {
  fbq("track", "AddToWishlist", {
    content_type: "product",
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    value: productPrice(product),
    currency: CURRENCY
  });
}

/** Standard Meta `Search` event. */
export function search(query: string) {
  const q = (query || "").trim();
  if (!q) return;
  fbq("track", "Search", { search_string: q });
}

/** Standard Meta `InitiateCheckout` event. */
export function initiateCheckout(
  cart: { id: string; qty: number }[],
  products: Product[],
  value: number
) {
  if (!cart.length) return;
  fbq("track", "InitiateCheckout", {
    content_ids: cart.map((i) => i.id),
    content_name: cart
      .map((i) => products.find((p) => p.id === i.id)?.name)
      .filter(Boolean)
      .join(", "),
    num_items: cart.reduce((total, i) => total + i.qty, 0),
    value,
    currency: CURRENCY
  });
}

/** Standard Meta `Purchase` event with product-level contents. */
export function purchase(
  order: { items: { id: string; qty: number }[]; total: number },
  products: Product[]
) {
  const contents = order.items.map((item) => {
    const product = products.find((p) => p.id === item.id);
    return {
      id: item.id,
      quantity: item.qty,
      item_price: product ? productPrice(product) : 0
    };
  });

  fbq("track", "Purchase", {
    value: order.total,
    currency: CURRENCY,
    content_ids: order.items.map((i) => i.id),
    content_name: contents
      .map((c) => products.find((p) => p.id === c.id)?.name)
      .filter(Boolean)
      .join(", "),
    num_items: order.items.reduce((total, i) => total + i.qty, 0),
    contents
  });
}

/** Standard Meta `CompleteRegistration` event. */
export function completeRegistration() {
  fbq("track", "CompleteRegistration", { content_name: "register" });
}

/** Standard Meta `Contact` event. */
export function contact() {
  fbq("track", "Contact", { content_category: "contact_form" });
}

/** Standard Meta `Lead` event. */
export function lead() {
  fbq("track", "Lead", { content_category: "newsletter" });
}

/**
 * Redux middleware that fires Meta events from existing store actions so the
 * tracking is centralized (no duplicated calls scattered across components).
 */
export const metaPixelMiddleware: Middleware =
  (storeApi) =>
  (next) =>
  (action) => {
    const result = next(action);
    if (typeof window === "undefined") return result;

    const type = (action as { type?: string })?.type ?? "";
    if (!type.startsWith("commerce/")) return result;

    try {
      const state = (storeApi.getState() as {
        commerce: { products: Product[]; wishlist: string[] };
      }).commerce;

      if (type === "commerce/addToCart") {
        const { id, qty } = (action as { payload: { id: string; qty: number } }).payload;
        const product = state.products.find((p) => p.id === id);
        if (product) addToCart(product, qty || 1);
      } else if (type === "commerce/toggleWishlist") {
        const id = (action as { payload: string }).payload;
        if (state.wishlist.includes(id)) {
          const product = state.products.find((p) => p.id === id);
          if (product) addToWishlist(product);
        }
      } else if (type === "commerce/viewProduct") {
        const id = (action as { payload: string }).payload;
        const product = state.products.find((p) => p.id === id);
        if (product) viewContent(product);
      } else if (type === "commerce/createOrder") {
        const order = (action as {
          payload: { items: { id: string; qty: number }[]; total: number };
        }).payload;
        if (order && order.items && order.items.length > 0) {
          purchase(order, state.products);
        }
      }
    } catch {
      // analytics must never break the application
    }

    return result;
  };
