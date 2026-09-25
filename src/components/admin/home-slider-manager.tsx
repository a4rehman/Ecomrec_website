"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  SlidersHorizontal, Plus, Trash2, ArrowUp, ArrowDown, 
  Check, Eye, Sparkles, AlertCircle, RefreshCw, Layers, CheckCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/data/products";
import type { HomeSliderItem } from "@/lib/slider-service";

interface HomeSliderManagerProps {
  products: Product[];
  onToast: (msg: string) => void;
}

export function HomeSliderManager({ products, onToast }: HomeSliderManagerProps) {
  const [sliders, setSliders] = useState<HomeSliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchSliders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/home-sliders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load home sliders");
      setSliders(data.sliders || []);
    } catch (err) {
      console.error("Error loading sliders:", err);
      setError(err instanceof Error ? err.message : "Failed to load home sliders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleAddProduct = (product: Product) => {
    const defaultImage = product.images.find((img) => img && !img.startsWith("data:")) || product.images[0] || "/images/hero_lawn.png";
    const newItem: HomeSliderItem = {
      id: `temp-${Date.now()}`,
      productId: product.id,
      selectedImage: defaultImage,
      sliderOrder: sliders.length + 1,
      tagline: product.category?.toUpperCase() || "PREMIUM EMBROIDERY",
      title: product.name,
      description: product.fabric ? `${product.fabric} with signature embroidery and handcrafted details.` : (product.description?.slice(0, 140) || ""),
      ctaText: "SHOP NOW",
      ratingText: "Handcrafted Luxury & Premium Fabrics",
      objectPosition: "center 22%",
      isActive: true,
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        images: product.images,
        fabric: product.fabric,
        description: product.description,
        status: product.status,
        isActive: product.isActive,
      },
    };

    setSliders([...sliders, newItem]);
    setShowAddSelector(false);
    onToast(`Added "${product.name}" to Home Slider! Click 'Save Changes' to publish.`);
  };

  const handleRemove = (index: number) => {
    const next = [...sliders];
    next.splice(index, 1);
    // Re-index order
    const reindexed = next.map((item, idx) => ({ ...item, sliderOrder: idx + 1 }));
    setSliders(reindexed);
  };

  const handleToggleActive = (index: number) => {
    const next = [...sliders];
    next[index] = { ...next[index], isActive: !next[index].isActive };
    setSliders(next);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sliders.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const next = [...sliders];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    const reindexed = next.map((item, idx) => ({ ...item, sliderOrder: idx + 1 }));
    setSliders(reindexed);
  };

  const handleSelectImage = (index: number, image: string) => {
    const next = [...sliders];
    next[index] = { ...next[index], selectedImage: image };
    setSliders(next);
  };

  const handleFieldChange = (index: number, field: keyof HomeSliderItem, value: any) => {
    const next = [...sliders];
    next[index] = { ...next[index], [field]: value };
    setSliders(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        sliders: sliders.map((s, idx) => ({
          productId: s.productId,
          selectedImage: s.selectedImage,
          sliderOrder: idx + 1,
          isActive: s.isActive,
          tagline: s.tagline,
          title: s.title,
          description: s.description,
          ctaText: s.ctaText,
          ratingText: s.ratingText,
          objectPosition: s.objectPosition,
        })),
      };

      const res = await fetch("/api/admin/home-sliders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Failed to save home sliders");

      setSliders(data.sliders || []);
      onToast("Homepage Hero Slider updated and published successfully!");
    } catch (err) {
      console.error("Save sliders error:", err);
      setError(err instanceof Error ? err.message : "Failed to save home sliders");
    } finally {
      setSaving(false);
    }
  };

  // Filter available products for adding
  const filteredProductsToAdd = products.filter((p) => {
    const match =
      p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchProductQuery.toLowerCase());
    return match && p.status !== "draft" && p.isActive !== false;
  });

  const activeSlidersCount = sliders.filter((s) => s.isActive).length;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-3xl md:text-4xl">Home Hero Slider</h2>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              {activeSlidersCount} Active / {sliders.length} Total
            </span>
          </div>
          <p className="text-xs text-muted mt-1 max-w-xl">
            Select existing products from the database to feature on the homepage hero slider. Pick the exact product image, set slide display order, and configure custom copy if desired.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddSelector(!showAddSelector)}
            className="flex items-center gap-2 text-xs"
          >
            <Plus size={15} /> Add Product to Slider
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check size={15} /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Product Modal / Dropdown Tray */}
      {showAddSelector && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-accent" /> Select Product from Database
            </h3>
            <button
              onClick={() => setShowAddSelector(false)}
              className="text-xs text-muted hover:text-foreground underline"
            >
              Close
            </button>
          </div>

          <Input
            placeholder="Search products by name or category..."
            value={searchProductQuery}
            onChange={(e) => setSearchProductQuery(e.target.value)}
            className="mb-4 bg-background"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
            {filteredProductsToAdd.map((product) => {
              const previewImg = product.images.find((i) => i && !i.startsWith("data:")) || product.images[0] || "/images/hero_lawn.png";
              const isAlreadyIn = sliders.some((s) => s.productId === product.id);

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded border border-line bg-background p-3 hover:border-accent/60 transition cursor-pointer"
                  onClick={() => handleAddProduct(product)}
                >
                  <div className="relative w-12 aspect-[3/4] overflow-hidden rounded bg-neutral-100 shrink-0 border border-line">
                    <Image src={previewImg} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{product.name}</p>
                    <p className="text-[11px] text-muted">{product.category} • {formatPrice(product.price)}</p>
                    {isAlreadyIn && (
                      <span className="text-[10px] text-amber-600 font-medium">In Slider</span>
                    )}
                  </div>
                  <Button type="button" variant="ghost" className="shrink-0 min-h-0 h-8 px-3 text-xs text-accent">
                    + Add
                  </Button>
                </div>
              );
            })}

            {filteredProductsToAdd.length === 0 && (
              <p className="col-span-full py-6 text-center text-xs text-muted">
                {products.length === 0
                  ? "No products found in the database. Please create products first in Manage Products."
                  : "No matching published products found."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Slider Items List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted">
          <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-accent" />
          Loading home sliders...
        </div>
      ) : sliders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line py-16 text-center">
          <Layers size={32} className="mx-auto mb-3 text-muted" />
          <h3 className="font-serif text-lg font-medium">No Products in Home Slider</h3>
          <p className="text-xs text-muted max-w-md mx-auto mt-1 mb-5">
            Click &quot;Add Product to Slider&quot; to pick existing products from your database and feature them on the homepage hero.
          </p>
          <Button
            type="button"
            onClick={() => setShowAddSelector(true)}
            className="text-xs bg-foreground text-background hover:bg-neutral-800"
          >
            <Plus size={14} className="mr-1" /> Add Your First Product Slide
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sliders.map((slider, index) => {
            const product = slider.product || products.find((p) => p.id === slider.productId);
            const productImages = product?.images || (slider.selectedImage ? [slider.selectedImage] : []);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={slider.id || index}
                className={`rounded-lg border transition-all ${
                  slider.isActive
                    ? "border-line bg-background/60 hover:border-accent/40"
                    : "border-line/40 bg-neutral-50/50 dark:bg-neutral-900/20 opacity-60"
                }`}
              >
                {/* Main Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Order & Move buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-accent/15 text-xs font-bold text-accent">
                      #{index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                        className="rounded p-1 text-muted hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={index === sliders.length - 1}
                        onClick={() => handleMove(index, "down")}
                        className="rounded p-1 text-muted hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Selected Image Preview */}
                  <div className="relative w-16 aspect-[3/4] rounded overflow-hidden border border-line shrink-0 bg-neutral-100">
                    {slider.selectedImage && (
                      <Image
                        src={slider.selectedImage}
                        alt={slider.title || "Slide Image"}
                        fill
                        className="object-cover"
                        style={{ objectPosition: slider.objectPosition || "center 22%" }}
                      />
                    )}
                  </div>

                  {/* Product Details & Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base font-semibold truncate">
                        {slider.title || product?.name || "Untitled Product"}
                      </h4>
                      {product && (
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="text-muted hover:text-accent"
                          title="View Product Page"
                        >
                          <Eye size={14} />
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {product?.category || "Category"} • {product ? formatPrice(product.price) : ""} • Slug: <span className="font-mono">{product?.slug}</span>
                    </p>
                    <p className="text-[11px] text-accent mt-0.5 font-medium">
                      CTA: {slider.ctaText || "SHOP NOW"} → /product/{product?.slug}
                    </p>
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Active toggle button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(index)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
                        slider.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                          : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {slider.isActive ? "Active (ON)" : "Disabled (OFF)"}
                    </button>

                    {/* Customize toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="flex items-center gap-1 text-xs border border-line rounded px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <span>Customize</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded border border-transparent hover:border-red-200 transition"
                      title="Remove from slider"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Image Selection & Custom Text Overrides */}
                {isExpanded && (
                  <div className="border-t border-line/60 bg-neutral-50/50 dark:bg-neutral-900/30 p-5 space-y-5">
                    {/* Select from existing product images */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                        Select Hero Image from Product Gallery ({productImages.length} available)
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {productImages.map((img, imgIdx) => {
                          const isSelected = slider.selectedImage === img;
                          return (
                            <button
                              key={imgIdx}
                              type="button"
                              onClick={() => handleSelectImage(index, img)}
                              className={`relative w-20 aspect-[3/4] rounded overflow-hidden border-2 transition ${
                                isSelected
                                  ? "border-accent ring-2 ring-accent/30 shadow-md"
                                  : "border-line/60 hover:border-accent/60 opacity-75 hover:opacity-100"
                              }`}
                            >
                              <Image src={img} alt={`Image ${imgIdx + 1}`} fill className="object-cover" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-accent text-accent-foreground rounded-full p-0.5">
                                  <Check size={10} strokeWidth={3} />
                                </div>
                              )}
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-0.5">
                                Img {imgIdx + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional Custom Copy Overrides */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                          Tagline / Category Eyebrow
                        </label>
                        <Input
                          value={slider.tagline || ""}
                          placeholder={product?.category?.toUpperCase() || "PREMIUM EMBROIDERY"}
                          onChange={(e) => handleFieldChange(index, "tagline", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                          Main Headline / Title
                        </label>
                        <Input
                          value={slider.title || ""}
                          placeholder={product?.name || "Product Name"}
                          onChange={(e) => handleFieldChange(index, "title", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                          Description Copy
                        </label>
                        <Input
                          value={slider.description || ""}
                          placeholder={product?.description?.slice(0, 80) || "Handcrafted luxury..."}
                          onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">
                            CTA Button Text
                          </label>
                          <Input
                            value={slider.ctaText || ""}
                            placeholder="SHOP NOW"
                            onChange={(e) => handleFieldChange(index, "ctaText", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">
                            Image Focus / Position
                          </label>
                          <select
                            value={slider.objectPosition || "center 22%"}
                            onChange={(e) => handleFieldChange(index, "objectPosition", e.target.value)}
                            className="w-full h-9 rounded border border-line bg-background px-3 text-xs outline-none"
                          >
                            <option value="center 22%">Center (Model Portrait - Recommended)</option>
                            <option value="center top">Top Focused</option>
                            <option value="center center">Dead Center</option>
                            <option value="center bottom">Bottom Focused</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
