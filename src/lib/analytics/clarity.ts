/**
 * Microsoft Clarity Client-side Helper
 * Project ID: yruy4soy4n
 */

export const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "yruy4soy4n";

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

/**
 * Safe Clarity wrapper — never throws, no-ops if not in browser or not loaded.
 */
export function clarity(...args: any[]) {
  if (typeof window === "undefined" || !window.clarity) return;
  try {
    window.clarity(...args);
  } catch (err) {
    console.debug("[clarity] Error:", err);
  }
}

/**
 * Set custom tag in Microsoft Clarity
 */
export function claritySetTag(key: string, value: string | string[]) {
  clarity("set", key, value);
}

/**
 * Identify a user / session in Microsoft Clarity
 */
export function clarityIdentify(customId: string, sessionId?: string, pageId?: string) {
  clarity("identify", customId, sessionId, pageId);
}

/**
 * Upgrade session with high-value actions (e.g. AddToCart, Checkout)
 */
export function clarityEvent(eventName: string) {
  clarity("event", eventName);
}
