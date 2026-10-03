"use client";

import { useEffect, useRef, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga4";
import { CLARITY_PROJECT_ID } from "@/lib/analytics/clarity";
import { trackPageView } from "@/lib/analytics";
import { initSessionLifecycle } from "@/lib/analytics/session-tracker";

function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // 1. Initialize session lifecycle (heartbeat + pagehide listener)
  useEffect(() => {
    const cleanup = initSessionLifecycle();
    return cleanup;
  }, []);

  // 2. Track Page View on Route Changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      trackPageView(pathname || "/");
      return;
    }

    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname || "/";

    trackPageView(fullPath);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Universal Analytics & Session Intelligence Script Manager.
 * Handles GA4, Microsoft Clarity, route transitions, and session heartbeat.
 */
export function AnalyticsScripts() {
  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

      {/* Google Analytics 4 (gtag.js) */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                send_page_view: false
              });
            `}
          </Script>
        </>
      )}

      {/* Microsoft Clarity */}
      {CLARITY_PROJECT_ID && (
        <Script id="microsoft-clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
      )}
    </>
  );
}
