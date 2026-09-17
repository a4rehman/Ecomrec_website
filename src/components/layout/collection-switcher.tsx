"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, setPriceTier } from "@/store/store";
import { Sparkles, ShoppingBag } from "lucide-react";

export function CollectionSwitcher() {
  const dispatch = useDispatch();
  const priceTier = useSelector((state: RootState) => state.commerce.priceTier);

  const handleToggle = (tier: "premium" | "simple") => {
    if (priceTier === tier) {
      dispatch(setPriceTier("all"));
    } else {
      dispatch(setPriceTier(tier));
    }
  };

  return (
    <div className="flex items-center justify-center text-xs">
      <div className="inline-flex items-center gap-1 rounded-full border border-line/80 bg-background/95 p-1.5 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleToggle("premium")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium tracking-wider uppercase transition-all duration-300 ${
            priceTier === "premium"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Sparkles size={14} className={priceTier === "premium" ? "text-white" : "text-accent"} />
          <span className="font-semibold text-[11px] sm:text-xs">Luxury Atelier</span>
          <span className="text-[10px] opacity-75 font-normal">(Rs. 5,000+)</span>
        </button>

        <button
          type="button"
          onClick={() => handleToggle("simple")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium tracking-wider uppercase transition-all duration-300 ${
            priceTier === "simple"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <ShoppingBag size={14} className={priceTier === "simple" ? "text-white" : "text-accent"} />
          <span className="font-semibold text-[11px] sm:text-xs">Everyday Essentials</span>
          <span className="text-[10px] opacity-75 font-normal">(Under Rs. 5,000)</span>
        </button>
      </div>
    </div>
  );
}
