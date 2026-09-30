"use client";

import Script from "next/script";

const AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ||
  "agent_0101m0djgs4ee4japagr41r30btf";

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
        ElevenLabs ConvAI custom element.
        Positioned fixed at bottom-right corner, cleanly elevated above taskbars and mobile navs.
      */}
      <div
        aria-label="AI Shopping Assistant"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 pointer-events-auto"
        style={{ zIndex: 9999 }}
      >
        <elevenlabs-convai agent-id={AGENT_ID} />
      </div>
    </>
  );
}
