"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

const MERCHANT_ID = 5858037911;

/**
 * Google Customer Reviews Badge Integration.
 *
 * Displays the Google Customer Reviews seller badge and rating on the site.
 * - Client-side leaf component — keeps RootLayout as a Server Component.
 * - Loaded asynchronously with strategy="lazyOnload" to prevent render-blocking.
 * - Positioned at "BOTTOM_LEFT" so it never conflicts with bottom-right floating widgets.
 */
export function GoogleCustomerReviewsBadge() {
  const initializedRef = useRef(false);

  const initBadge = () => {
    if (initializedRef.current) return;
    if (typeof window !== "undefined" && window.merchantwidget) {
      initializedRef.current = true;
      window.merchantwidget.start({
        merchant_id: MERCHANT_ID,
        position: "BOTTOM_LEFT"
      });
    }
  };

  useEffect(() => {
    initBadge();
  }, []);

  return (
    <Script
      id="merchantWidgetScript"
      src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
      strategy="lazyOnload"
      onLoad={initBadge}
    />
  );
}
