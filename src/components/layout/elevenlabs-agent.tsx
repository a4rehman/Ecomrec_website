"use client";

import Script from "next/script";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

/**
 * ElevenLabs Conversational AI Shopping & Customer-Support Widget.
 *
 * Follows the same pattern as MetaPixel in this codebase:
 * - "use client" only on this leaf component — root layout stays a Server Component.
 * - External script loaded with strategy="lazyOnload" so it never blocks rendering.
 * - Renders the <elevenlabs-convai> custom element which the loaded script upgrades.
 * - Positioned fixed bottom-right, above any potential WhatsApp button (z-40).
 * - Silently disabled when NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set.
 * - The rest of the site continues to work even if the ElevenLabs CDN is unavailable.
 */
export function ElevenLabsAgent() {
  if (!AGENT_ID) return null;

  return (
    <>
      {/* Load the ElevenLabs widget embed script non-blocking */}
      <Script
        id="elevenlabs-convai-script"
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
        type="text/javascript"
      />

      {/*
        The custom element is upgraded by the script above once it loads.
        Fixed positioning keeps it out of the document flow — it will never
        affect the footer grid, product cards, or any other layout element.
        z-40 sits below the cart drawer / header (z-50) but above page content.
      */}
      <div
        aria-label="AI Shopping Assistant"
        className="fixed bottom-6 right-6 z-40"
      >
        <elevenlabs-convai agent-id={AGENT_ID} />
      </div>
    </>
  );
}
