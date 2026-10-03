/**
 * Lightweight, zero-dependency User-Agent and client environment parser.
 */

export interface DeviceInfo {
  deviceType: "mobile" | "tablet" | "desktop";
  browser: string;
  operatingSystem: string;
}

export function parseUserAgent(uaString?: string | null): DeviceInfo {
  const ua = uaString || (typeof navigator !== "undefined" ? navigator.userAgent : "");

  if (!ua) {
    return {
      deviceType: "desktop",
      browser: "Unknown",
      operatingSystem: "Unknown",
    };
  }

  // 1. Device Type
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = "tablet";
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    deviceType = "mobile";
  }

  // 2. Operating System
  let operatingSystem = "Other";
  if (/Windows NT 10.0/i.test(ua)) operatingSystem = "Windows 10/11";
  else if (/Windows/i.test(ua)) operatingSystem = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) operatingSystem = "iOS";
  else if (/Android/i.test(ua)) operatingSystem = "Android";
  else if (/Mac OS X|Macintosh/i.test(ua)) operatingSystem = "macOS";
  else if (/Linux/i.test(ua)) operatingSystem = "Linux";

  // 3. Browser
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Opera|OPR\//i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";

  return {
    deviceType,
    browser,
    operatingSystem,
  };
}

export function classifyTrafficSource(referrer?: string | null, utmSource?: string | null): string {
  if (utmSource) {
    const src = utmSource.toLowerCase();
    if (src.includes("instagram") || src.includes("ig")) return "Instagram Ads/Bio";
    if (src.includes("facebook") || src.includes("fb")) return "Facebook Ads";
    if (src.includes("google")) return "Google Ads/Search";
    if (src.includes("whatsapp")) return "WhatsApp Direct";
    if (src.includes("tiktok")) return "TikTok";
    return `Campaign (${utmSource})`;
  }

  if (!referrer || referrer === "" || referrer === "undefined") {
    return "Direct";
  }

  const ref = referrer.toLowerCase();
  if (ref.includes("google.com") || ref.includes("google.com.pk")) return "Google Search";
  if (ref.includes("instagram.com")) return "Instagram";
  if (ref.includes("facebook.com") || ref.includes("fb.com")) return "Facebook";
  if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return "WhatsApp";
  if (ref.includes("bing.com")) return "Bing";
  if (ref.includes("youtube.com")) return "YouTube";
  if (ref.includes("saweracollection.com")) return "Direct / Internal";

  try {
    const url = new URL(referrer);
    return `Referral (${url.hostname.replace(/^www\./, "")})`;
  } catch {
    return "Referral";
  }
}
