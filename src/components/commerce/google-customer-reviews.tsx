"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface GoogleCustomerReviewsProps {
  orderId: string;
  email: string;
  deliveryCountry?: string;
  estimatedDeliveryDate?: string;
}

export function GoogleCustomerReviews({
  orderId,
  email,
  deliveryCountry = "PK",
  estimatedDeliveryDate
}: GoogleCustomerReviewsProps) {
  const renderedRef = useRef(false);

  // Standard delivery for Sawera Collection is 2-4 business days.
  // Calculate delivery date formatted as YYYY-MM-DD (4 calendar days from order placement).
  const deliveryDate =
    estimatedDeliveryDate ||
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 4);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })();

  useEffect(() => {
    if (!orderId || !email) return;

    window.renderOptIn = () => {
      if (renderedRef.current) return;
      if (window.gapi) {
        window.gapi.load("surveyoptin", () => {
          if (window.gapi?.surveyoptin && !renderedRef.current) {
            renderedRef.current = true;
            window.gapi.surveyoptin.render({
              merchant_id: 5858037911,
              order_id: orderId,
              email: email,
              delivery_country: deliveryCountry,
              estimated_delivery_date: deliveryDate
            });
          }
        });
      }
    };

    // If Google platform.js is already present in browser, trigger renderOptIn immediately
    if (typeof window !== "undefined" && window.gapi && !renderedRef.current) {
      window.renderOptIn();
    }
  }, [orderId, email, deliveryCountry, deliveryDate]);

  if (!orderId || !email) return null;

  return (
    <Script
      id="google-customer-reviews-platform"
      src="https://apis.google.com/js/platform.js?onload=renderOptIn"
      strategy="lazyOnload"
    />
  );
}
