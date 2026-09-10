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
    <div className="flex items-center justify-center py-2 text-xs">
      <div className="inline-flex rounded-full border border-line bg-panel/90 p-1 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleToggle("premium")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-medium tracking-wide uppercase transition duration-300 ${
            priceTier === "premium"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Sparkles size={13} className={priceTier === "premium" ? "text-white" : "text-accent"} />
          Luxury Atelier <span className="text-[10px] opacity-75">(Rs. 5,000+)</span>
        </button>
        <button
          type="button"
          onClick={() => handleToggle("simple")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-medium tracking-wide uppercase transition duration-300 ${
            priceTier === "simple"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <ShoppingBag size={13} className={priceTier === "simple" ? "text-white" : "text-accent"} />
          Everyday Essentials <span className="text-[10px] opacity-75">(Under Rs. 5,000)</span>
        </button>
      </div>
    </div>
  );
}
