"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID, pageView } from "@/lib/metaPixel";

const PIXEL_SCRIPT = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;

/**
 * Global Meta Pixel installation.
 * - Loads the base script lazily with `afterInteractive` (no render blocking).
 * - Fires the initial PageView inside the base script on first load.
 * - Fires PageView again on every client-side route change (no duplicates).
 */
export function MetaPixel() {
  const pathname = usePathname();
  const firstRun = useRef(true);
  const lastFired = useRef<string | null>(null);

  useEffect(() => {
    // The base script already fires PageView once on initial load,
    // so we skip the very first render to avoid a duplicate event.
    if (firstRun.current) {
      firstRun.current = false;
      lastFired.current = pathname;
      return;
    }
    if (lastFired.current === pathname) return;
    lastFired.current = pathname;
    pageView();
  }, [pathname]);

  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: PIXEL_SCRIPT }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
