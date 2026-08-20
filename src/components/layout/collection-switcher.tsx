"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, setPriceTier } from "@/store/store";
import { Sparkles, ShoppingBag } from "lucide-react";

export function CollectionSwitcher() {
  const dispatch = useDispatch();
  const priceTier = useSelector((state: RootState) => state.commerce.priceTier);

  // Default to premium if it's set to all
  const activeTier = priceTier === "simple" ? "simple" : "premium";

  const handleToggle = (tier: "premium" | "simple") => {
    dispatch(setPriceTier(tier));
  };

  return (
    <div className="flex items-center justify-center border-b border-line bg-background/80 py-1.5 text-xs backdrop-blur-xl">
      <div className="flex rounded-full border border-line bg-panel p-1 shadow-sm">
        <button
          onClick={() => handleToggle("premium")}
          className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 font-medium tracking-wide uppercase transition duration-300 ${
            activeTier === "premium"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Sparkles size={12} className={activeTier === "premium" ? "text-white" : ""} />
          Luxury Atelier <span className="text-[10px] opacity-75">(Rs. 5,000+)</span>
        </button>
        <button
          onClick={() => handleToggle("simple")}
          className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 font-medium tracking-wide uppercase transition duration-300 ${
            activeTier === "simple"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <ShoppingBag size={12} />
          Everyday Essentials <span className="text-[10px] opacity-75">(Under Rs. 5,000)</span>
        </button>
      </div>
    </div>
  );
}
