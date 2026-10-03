"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { MessageSquare, Sparkles, X, Minimize2, Mic } from "lucide-react";
import { trackChatbot } from "@/lib/analytics";

const AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ||
  "agent_0101m0djgs4ee4japagr41r30btf";

export function ElevenLabsAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { cartDrawerOpen } = useSelector((s: RootState) => s.commerce);

  const isCheckout = pathname === "/checkout";

  const handleOpen = () => {
    setIsOpen(true);
    trackChatbot("OPEN");
  };

  const handleClose = () => {
    setIsOpen(false);
    trackChatbot("CLOSE");
  };

  // Automatically minimize chatbot when Cart Drawer opens
  useEffect(() => {
    if (cartDrawerOpen && isOpen) {
      setIsOpen(false);
      trackChatbot("CLOSE");
    }
  }, [cartDrawerOpen, isOpen]);

  // Keep closed on route navigation by default
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!AGENT_ID) return null;

  return (
    <>
      {/* Load ElevenLabs widget embed script lazily */}
      <Script
        id="elevenlabs-convai-script"
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
        type="text/javascript"
      />

      {/* When cart drawer is open, hide or push down floating trigger to ensure 100% cart priority */}
      <aside
        aria-label="Sawera AI Shopping Assistant"
        className={`fixed z-40 transition-all duration-300 ease-out ${
          cartDrawerOpen ? "pointer-events-none opacity-0 translate-y-8" : "pointer-events-auto opacity-100 translate-y-0"
        } ${
          isCheckout
            ? "bottom-4 right-4 sm:bottom-6 sm:right-6"
            : "bottom-5 right-4 sm:bottom-6 sm:right-6"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        {/* EXPANDED CHATBOT PANEL */}
        {isOpen ? (
          <div
            className="flex flex-col rounded-2xl border border-line bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 w-[calc(100vw-28px)] sm:w-[380px] max-w-[400px] overflow-hidden"
            style={{
              maxHeight: "min(560px, 78vh)",
            }}
          >
            {/* Custom Luxury Header */}
            <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-panel/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-sm">
                  <Sparkles size={16} />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-sm font-semibold text-foreground truncate">
                    Sawera AI Stylist
                  </h3>
                  <p className="text-[10px] text-muted flex items-center gap-1 truncate">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Voice &amp; Shopping Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-1.5 text-muted hover:bg-neutral-100 hover:text-foreground transition-colors"
                  aria-label="Minimize Sawera AI"
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-1.5 text-muted hover:bg-neutral-100 hover:text-foreground transition-colors"
                  aria-label="Close Sawera AI"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Widget container */}
            <div className="p-3 sm:p-4 flex flex-col items-center justify-center min-h-[140px] bg-background">
              <div className="w-full flex justify-center elevenlabs-embed-wrapper">
                <elevenlabs-convai agent-id={AGENT_ID} />
              </div>
              <p className="mt-3 text-[11px] text-muted text-center leading-relaxed">
                Tap the microphone or button above to speak with Sawera AI about suits, sizing, fabrics, or order status.
              </p>
            </div>
          </div>
        ) : (
          /* COLLAPSED FLOATING LUXURY BUTTON */
          <div className="relative flex items-center">
            {/* Subtle floating tooltip on hover */}
            <div
              className={`absolute right-full mr-3 hidden sm:flex items-center gap-1.5 rounded-full border border-line bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition-all duration-200 pointer-events-none whitespace-nowrap ${
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
              }`}
            >
              <Sparkles size={13} className="text-accent" />
              <span>Ask Sawera AI</span>
            </div>

            {/* Small circular trigger button */}
            <button
              type="button"
              onClick={handleOpen}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-accent text-white shadow-xl ring-2 ring-background transition-all duration-300 hover:scale-105 hover:bg-foreground active:scale-95 focus-ring"
              aria-label="Open Sawera AI Assistant"
            >
              {/* Subtle pulsing glow ring */}
              <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping opacity-40 group-hover:opacity-0" />

              {/* Icon */}
              <div className="relative flex items-center justify-center">
                <Mic size={20} className="sm:size-[22px] transition-transform duration-300 group-hover:scale-110" />
                <Sparkles size={10} className="absolute -top-1 -right-1 text-accent-2 animate-bounce" />
              </div>

              {/* Mini Online Status Dot */}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
