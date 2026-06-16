// "use client" ensures component runs on client side
"use client";

import React from "react";

/**
 * Announcement Marquee – scrolls the free‑shipping text continuously.
 * Utilises the `@keyframes marquee` defined in globals.css.
 */
export default function AnnouncementMarquee() {
  const text = "FREE SHIPPING IN PAKISTAN · GLOBAL EXPRESS SHIPPING OVER $350";
  return (
    <div className="container-lux flex h-full items-center overflow-hidden whitespace-nowrap">
      {/* Duplicate the text to create a seamless loop */}
      <div className="flex animate-[marquee_20s_linear_infinite] hover:animate-none">
        <span className="mr-8 text-[10px] font-bold tracking-[.22em] uppercase">{text}</span>
        <span className="mr-8 text-[10px] font-bold tracking-[.22em] uppercase">{text}</span>
      </div>
    </div>
  );
}
