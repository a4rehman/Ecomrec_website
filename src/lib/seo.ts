import { Product } from "@/data/products";

export const SITE_URL = "https://www.saweracollection.com";
export const SITE_NAME = "Sawera Collection";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/sawera-logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description:
    "Premium women's fashion brand in Pakistan — luxury lawn, festive & formal wear.",
  email: "support@saweracollection.com",
  telephone: "+92 306 6378857",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92 306 6378857",
    contactType: "customer service",
    availableLanguage: ["en", "ur"]
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?query={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export const productSchema = (product: Product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  image: product.images
    .filter((img) => !img.startsWith("data:"))
    .map((img) => (img.startsWith("http") ? img : `${SITE_URL}${img}`)),
  description: product.description,
  sku: product.slug,
  brand: {
    "@type": "Brand",
    name: product.brand
  },
  category: product.category,
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/product/${product.slug}`,
    priceCurrency: "PKR",
    price: product.salePrice && product.salePrice > 0 ? product.salePrice : product.price,
    priceValidUntil: product.saleEnd
      ? new Date(product.saleEnd).toISOString()
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition"
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: product.rating,
    reviewCount: product.reviews
  }
});

export const blogSchema = (post: { slug: string; title: string; category: string; image: string; excerpt: string }) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  image: post.image.startsWith("data:")
    ? undefined
    : post.image.startsWith("http")
    ? post.image
    : `${SITE_URL}${post.image}`,
  url: `${SITE_URL}/blog/${post.slug}`,
  description: post.excerpt,
  articleSection: post.category,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/sawera-logo.png`
    }
  }
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`
  }))
});
