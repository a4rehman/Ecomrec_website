"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Heart, ZoomIn } from "lucide-react";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { productImageAlt } from "@/lib/seo";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, RootState, toggleWishlist, viewProduct, openCartDrawer } from "@/store/store";
import { ProductCard } from "./product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Link from "next/link";

export function ProductDetailClient({ initialProduct, slug }: { initialProduct?: Product; slug: string }) {
  const { products, priceTier } = useSelector((s: RootState) => s.commerce);
  const product = products.find((p) => p.slug === slug) || initialProduct;

  if (!product) {
    return (
      <div className="container-lux py-24 text-center">
        <p className="text-muted mb-4 font-serif text-2xl">Looking for Sawera creations...</p>
        <Link href="/shop" className="text-accent underline uppercase tracking-wider text-xs font-semibold">
          Back to collections
        </Link>
      </div>
    );
  }

  return <ProductDetailContent product={product} priceTier={priceTier} products={products} />;
}

function getProductOccasion(category: string) {
  const map: Record<string, string> = {
    "Bridal & Couture": "Weddings, mehndi and bridal events",
    "Festive Chiffon": "Eid, festive gatherings and evening formals",
    "Luxury Lawn": "Daytime formals and elegant summer events",
    "Printed Lawn": "Everyday wear and casual summer outings",
    "Winter Festive": "Winter formals and festive evenings",
    "Everyday Essentials": "Casual daily wear and office style",
    Sale: "Everyday wear and special occasions"
  };
  return map[category] || "Versatile occasions, from casual to formal";
}

function getProductSeason(category: string) {
  const map: Record<string, string> = {
    "Luxury Lawn": "Summer",
    "Printed Lawn": "Summer",
    "Winter Festive": "Winter",
    "Festive Chiffon": "All season",
    "Bridal & Couture": "All season",
    "Everyday Essentials": "All season",
    Sale: "All season"
  };
  return map[category] || "All season";
}

function ProductDetailContent({ product, priceTier, products }: { product: Product; priceTier: string; products: Product[] }) {
  const [image, setImage] = useState(product.images[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const dispatch = useDispatch();
  const wished = useSelector((s: RootState) => s.commerce.wishlist.includes(product.id));
  const recentlyViewedIds = useSelector((s: RootState) => s.commerce.recentlyViewed);

  const relatedProducts = useMemo(() => {
    const sameCategory = products.filter((p) => p.id !== product.id && p.category === product.category);
    const priceTierFiltered = products.filter(
      (p) =>
        p.id !== product.id &&
        p.category !== product.category &&
        (priceTier === "premium" ? p.price >= 5000 : priceTier === "simple" ? p.price < 5000 : true)
    );
    return [...sameCategory, ...priceTierFiltered].slice(0, 4);
  }, [products, product.id, product.category, priceTier]);

  const recentlyViewed = useMemo(
    () =>
      recentlyViewedIds
        .filter((id) => id !== product.id)
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 4),
    [recentlyViewedIds, products, product.id]
  );

  // Stitching selectors logic
  const hasUnstitched = product.sizes.includes("Unstitched");
  const [suitStyle, setSuitStyle] = useState(hasUnstitched ? "Unstitched" : "Stitched");

  const handleStyleChange = (style: string) => {
    setSuitStyle(style);
    if (style === "Unstitched") {
      setSize("Unstitched");
    } else {
      const defaultStitchedSize = product.sizes.find((s) => s !== "Unstitched") || product.sizes[0];
      setSize(defaultStitchedSize);
    }
  };

  const visibleSizes = suitStyle === "Stitched"
    ? product.sizes.filter((s) => s !== "Unstitched")
    : ["Unstitched"];

  const handleColorChange = (c: string) => {
    setColor(c);
    const idx = product.colors.indexOf(c);
    if (idx !== -1 && product.images[idx]) {
      setImage(product.images[idx]);
    }
  };

  const handleImageClick = (src: string) => {
    setImage(src);
    const idx = product.images.indexOf(src);
    if (idx !== -1 && product.colors[idx]) {
      setColor(product.colors[idx]);
    }
  };

  useEffect(() => {
    // Reset selections on product change
    setImage(product.images[0]);
    setSize(product.sizes[0]);
    setColor(product.colors[0]);
    setSuitStyle(product.sizes.includes("Unstitched") ? "Unstitched" : "Stitched");
    
    dispatch(viewProduct(product.id));
  }, [dispatch, product.id, product]);


  return (
    <section className="container-lux py-12">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          { name: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` },
          { name: product.name, href: `/product/${product.slug}` }
        ]}
      />
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.15fr_.85fr] min-w-0">
        <div className="grid gap-4 md:grid-cols-[96px_1fr] min-w-0">
          <div className="order-2 flex gap-2.5 overflow-x-auto max-w-full pb-2 no-scrollbar md:order-1 md:flex-col md:overflow-visible md:pb-0">
            {product.images.map((src) => (
              <button
                className={`focus-ring relative aspect-square w-16 sm:w-20 md:w-24 shrink-0 overflow-hidden border transition ${image === src ? "border-accent ring-1 ring-accent" : "border-line"}`}
                aria-label={`View ${product.name} image`}
                aria-pressed={image === src}
                onClick={() => handleImageClick(src)}
                key={src}
              >
                <Image src={src} alt={productImageAlt(product)} fill sizes="(max-width: 768px) 80px, 96px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative order-1 aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-neutral-100 md:order-2">
            <Image
              src={image}
              alt={productImageAlt(product)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
            <span className="glass absolute bottom-3 right-3 sm:bottom-5 sm:right-5 flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
              <ZoomIn size={15} /> Hover to zoom
            </span>
          </div>
        </div>
        <div className="min-w-0 lg:sticky lg:top-32 lg:h-fit">
          <p className="tracked-luxury text-xs text-accent">{product.category}</p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl break-words leading-tight">{product.name}</h1>

          <p className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold">
            {formatPrice(product.price)}{" "}
            {product.compareAt && (
              <s className="ml-2 text-base font-normal text-muted">{formatPrice(product.compareAt)}</s>
            )}
          </p>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base leading-7 sm:leading-8 text-muted break-words">{product.description}</p>

          <div className="mt-8">
            <p className="mb-3 tracked-luxury text-xs">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`focus-ring border px-4 py-2 text-sm transition ${color === c ? "border-foreground bg-foreground text-background" : "border-line hover:border-accent"}`}
                  aria-pressed={color === c}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {hasUnstitched && (
            <div className="mt-6">
              <p className="mb-3 tracked-luxury text-xs">Suit Style</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStyleChange("Unstitched")}
                  className={`border px-4 py-2 text-sm ${suitStyle === "Unstitched" ? "border-foreground bg-foreground text-background" : "border-line"}`}
                >
                  Unstitched Fabric
                </button>
                <button
                  onClick={() => handleStyleChange("Stitched")}
                  className={`border px-4 py-2 text-sm ${suitStyle === "Stitched" ? "border-foreground bg-foreground text-background" : "border-line"}`}
                >
                  Stitched (Tailored)
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-3 tracked-luxury text-xs">
              {suitStyle === "Unstitched" ? "Selected Style" : "Size"}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`focus-ring min-w-12 border px-4 py-2 text-sm transition ${size === s ? "border-foreground bg-foreground text-background" : "border-line hover:border-accent"}`} aria-pressed={size === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {hasUnstitched && suitStyle === "Unstitched" && (
            <div className="mt-6 p-4 border border-line bg-background/50 text-xs text-muted leading-6">
              <p className="font-semibold text-foreground mb-1">Unstitched Fabric Details:</p>
              <p>- Shirt/Kameez fabric: 3.0 Meters premium lawn/chiffon</p>
              <p>- Trouser fabric: 2.5 Meters dyed cotton/silk</p>
              <p>- Dupatta fabric: 2.5 Meters printed/embroidered silk/organza</p>
              <p>- Includes all separate patches and borders as illustrated.</p>
            </div>
          )}
          {hasUnstitched && suitStyle === "Stitched" && (
            <div className="mt-6 p-4 border border-line bg-background/50 text-xs text-muted leading-6">
              <p className="font-semibold text-foreground mb-1">Stitching Service Details:</p>
              <p>- Premium boutique tailoring tailored to standard sizing guidelines.</p>
              <p>- Finished with inner lining (where appropriate) and custom styling trims.</p>
              <p>- Adds an extra 7-10 business days to processing timelines.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              className="flex-1 min-h-[44px]"
              onClick={() => {
                dispatch(addToCart({ id: product.id, qty: 1, size, color }));
                dispatch(openCartDrawer());
              }}
            >
              Add to Cart
            </Button>
            <Button variant="outline" onClick={() => dispatch(toggleWishlist(product.id))} className="min-h-[44px]">
              <Heart size={16} fill={wished ? "currentColor" : "none"} /> Wishlist
            </Button>
          </div>
          <Button
            className="mt-3 w-full bg-accent border-accent text-white hover:bg-foreground min-h-[44px]"
            onClick={() => { dispatch(addToCart({ id: product.id, qty: 1, size, color })); dispatch(openCartDrawer()); }}
          >
            Buy Now
          </Button>
          <div className="mt-8 border-t border-line pt-6 text-sm leading-7 text-muted">
            {product.fabric && product.fabric.toLowerCase() !== "not specified" && (
              <p>Fabric: {product.fabric}</p>
            )}
            <p>Stock: {product.stock} pieces available</p>
            <p>Shipping: 2-4 business days (unstitched) / 9-14 days (stitched)</p>
            <p>
              <Link href="/shop" className="text-accent underline">View all {product.category}</Link>
            </p>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <h2 className="tracked-luxury text-xs text-accent font-semibold mb-4">Product Details &amp; Care</h2>
            <dl className="grid gap-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-2">
                <dt className="text-muted font-medium">Fabric</dt>
                <dd className="text-foreground break-words">{product.fabric && product.fabric.toLowerCase() !== "not specified" ? product.fabric : "Premium lawn / chiffon"}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-2">
                <dt className="text-muted font-medium">Design</dt>
                <dd className="text-foreground break-words">{product.description}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-2">
                <dt className="text-muted font-medium">Colors</dt>
                <dd className="text-foreground break-words">{product.colors.join(", ")}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-2">
                <dt className="text-muted font-medium">Occasion</dt>
                <dd className="text-foreground break-words">{getProductOccasion(product.category)}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-2">
                <dt className="text-muted font-medium">Season</dt>
                <dd className="text-foreground break-words">{getProductSeason(product.category)}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-2">
                <dt className="text-muted font-medium">Care</dt>
                <dd className="text-foreground break-words">Dry clean only. Store in breathable cotton fabric to protect embroidery. Avoid direct sunlight and harsh detergents.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <section className="mt-14 sm:mt-20">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Related Products</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted">More {product.category} suits and similar styles from the Sawera Collection.</p>
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="mt-14 sm:mt-20">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Recently Viewed</h2>
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
