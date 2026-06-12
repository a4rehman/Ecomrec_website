"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

function ShopContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category");

  const { products, priceTier } = useSelector((state: RootState) => state.commerce);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [max, setMax] = useState(100000);
  const [sort, setSort] = useState("featured");

  // Determine price bounds based on active tier
  const minLimit = priceTier === "simple" ? 1000 : 5000;
  const maxLimit = priceTier === "simple" ? 5000 : 100000;

  useEffect(() => {
    if (catParam) {
      setCategory(catParam);
    }
  }, [catParam]);

  // Adjust price state if it goes out of active range limits
  useEffect(() => {
    if (priceTier === "simple" && max > 5000) {
      setMax(5000);
    } else if (priceTier === "premium" && max < 5000) {
      setMax(100000);
    }
  }, [priceTier, max]);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      // 1. Price tier filter
      if (priceTier === "premium" && p.price < 5000) return false;
      if (priceTier === "simple" && p.price >= 5000) return false;

      // 2. Search & filter controls
      return (
        (category === "All" || p.category === category) &&
        (brand === "All" || p.brand === brand) &&
        p.price <= max &&
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    });
    return [...list].sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : b.rating - a.rating);
  }, [products, query, category, brand, max, sort, priceTier]);

  // Filter available categories and brands for dropdown dynamically
  const availableCategories = useMemo(() => {
    const list = products.filter(p => priceTier === "premium" ? p.price >= 5000 : p.price < 5000);
    return [...new Set(list.map(p => p.category))];
  }, [products, priceTier]);

  const availableBrands = useMemo(() => {
    const list = products.filter(p => priceTier === "premium" ? p.price >= 5000 : p.price < 5000);
    return [...new Set(list.map(p => p.brand))];
  }, [products, priceTier]);

  return (
    <section className="container-lux py-14">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="tracked-luxury text-xs text-accent">Shop</p>
          <h1 className="font-serif text-6xl">
            {priceTier === "premium" ? "Luxury Atelier" : priceTier === "simple" ? "Everyday Essentials" : "Collections"}
          </h1>
        </div>
        <div className="relative max-w-md flex-1"><Search className="absolute left-3 top-3.5 text-muted" size={18} /><Input placeholder="Search products" className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="glass h-fit p-5">
          <h2 className="mb-5 flex items-center gap-2 tracked-luxury text-xs"><SlidersHorizontal size={16} /> Filters</h2>
          <label className="mb-4 block text-sm">Category<select className="mt-2 h-11 w-full border border-line bg-background px-3" value={category} onChange={(e) => setCategory(e.target.value)}><option>All</option>{availableCategories.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="mb-4 block text-sm">Brand<select className="mt-2 h-11 w-full border border-line bg-background px-3" value={brand} onChange={(e) => setBrand(e.target.value)}><option>All</option>{availableBrands.map((b) => <option key={b}>{b}</option>)}</select></label>
          <label className="mb-4 block text-sm">Max price: {formatPrice(max)}<input type="range" min={minLimit} max={maxLimit} step={priceTier === "simple" ? 200 : 1000} value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-3 w-full accent-[var(--accent)]" /></label>
          <Button variant="outline" className="w-full" onClick={() => { setQuery(""); setCategory("All"); setBrand("All"); setMax(maxLimit); }}>Reset</Button>
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4"><p className="text-sm text-muted">{filtered.length} products</p><select className="h-11 border border-line bg-background px-3" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-asc">Price low to high</option><option value="price-desc">Price high to low</option></select></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          <div className="mt-12 flex justify-center gap-2">{[1, 2, 3].map((n) => <button className="h-11 w-11 border border-line hover:bg-foreground hover:text-background" key={n}>{n}</button>)}</div>
        </div>
      </div>
    </section>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-lux py-24 text-center">Loading collections...</div>}>
      <ShopContent />
    </Suspense>
  );
}
