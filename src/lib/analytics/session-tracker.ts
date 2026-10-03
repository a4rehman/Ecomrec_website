/**
 * Client-Side Session Management & Event Dispatcher
 * Manages anonymous session token, heartbeats (30s), and pagehide beacons.
 */

const SESSION_STORAGE_KEY = "sawera_sid";
const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds

function generateSessionId(): string {
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  return `SWR-${timePart}${randomPart}`;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "SWR-SSR";

  try {
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = generateSessionId();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return generateSessionId();
  }
}

export function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utmSource: urlParams.get("utm_source") || undefined,
      utmMedium: urlParams.get("utm_medium") || undefined,
      utmCampaign: urlParams.get("utm_campaign") || undefined,
      utmTerm: urlParams.get("utm_term") || undefined,
      utmContent: urlParams.get("utm_content") || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Sends a tracking event to the internal analytics ingestion endpoint.
 * Non-blocking, fails gracefully.
 */
export async function sendAnalyticsEvent(
  eventType: string,
  data: {
    path?: string;
    pageTitle?: string;
    productId?: string;
    productName?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  if (typeof window === "undefined") return;

  const sessionId = getOrCreateSessionId();
  const utms = getUtmParams();

  const payload = {
    sessionId,
    eventType,
    path: data.path || window.location.pathname,
    pageTitle: data.pageTitle || document.title,
    referrer: document.referrer || undefined,
    ...utms,
    productId: data.productId,
    productName: data.productName,
    metadata: data.metadata,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  try {
    // Non-blocking fetch
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Analytics failure must never disrupt UX
    });
  } catch {
    // Silently ignore
  }
}

/**
 * Initializes the session heartbeat and unload beacon listener.
 */
export function initSessionLifecycle() {
  if (typeof window === "undefined") return;

  const sessionId = getOrCreateSessionId();

  // 1. Periodic Heartbeat (every 30s)
  const heartbeatTimer = setInterval(() => {
    try {
      fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, HEARTBEAT_INTERVAL_MS);

  // 2. Page Unload / Hide Beacon
  const handlePageHide = () => {
    try {
      const beaconData = JSON.stringify({ sessionId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/session/end", beaconData);
      } else {
        fetch("/api/analytics/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: beaconData,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  };

  window.addEventListener("pagehide", handlePageHide);

  return () => {
    clearInterval(heartbeatTimer);
    window.removeEventListener("pagehide", handlePageHide);
  };
}
