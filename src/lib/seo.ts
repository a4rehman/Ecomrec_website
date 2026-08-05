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
  foundingLocation: "Lahore, Pakistan",
  sameAs: [
    "https://www.instagram.com/saweracollection",
    "https://www.facebook.com/saweracollection",
    "https://www.tiktok.com/@saweracollection",
    "https://www.pinterest.com/saweracollection",
    "https://www.youtube.com/@saweracollection"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92 306 6378857",
    contactType: "customer service",
    contactOption: "TollFree",
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

export const blogSchema = (post: {
  slug: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  author?: string;
  date?: string;
  wordCount?: number;
}) => ({
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
  author: {
    "@type": "Organization",
    name: post.author || SITE_NAME
  },
  datePublished: post.date || "2025-01-01",
  dateModified: post.date || "2025-01-01",
  wordCount: post.wordCount,
  mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/sawera-logo.png`
    }
  }
});

export const collectionSchema = (name: string, description: string, url: string, numberOfItems?: number) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description,
  url: `${SITE_URL}${url}`,
  numberOfItems,
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL
  }
});

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/sawera-logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description:
    "Premium women's fashion store in Lahore, Pakistan — luxury lawn, embroidered suits, festive chiffon and bridal wear with nationwide delivery.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "88-B Block, Gulberg III",
    addressLocality: "Lahore",
    addressCountry: "PK"
  },
  telephone: "+92 306 6378857",
  email: "support@saweracollection.com",
  priceRange: "PKR 1,000 - 200,000",
  openingHours: "Mo-Sa 10:00-20:00",
  areaServed: "Pakistan",
  sameAs: [
    "https://www.instagram.com/saweracollection",
    "https://www.facebook.com/saweracollection",
    "https://www.tiktok.com/@saweracollection"
  ]
};

export const faqSchema = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a }
  }))
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

export const productImageAlt = (product: { name: string; category: string; colors?: string[] }) => {
  const color = product.colors?.[0] ? ` in ${product.colors[0].toLowerCase()}` : "";
  return `Pakistani women's ${product.category.toLowerCase()} suit${color} - ${product.name}`;
};

export const productFaqSchema = (product: Product) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: `What fabric is the ${product.name} made from?`,
      acceptedAnswer: { "@type": "Answer", text: `${product.fabric} — available in premium quality for a luxurious feel and finish.` }
    },
    {
      "@type": "Question",
      name: "Do you deliver this suit across Pakistan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Sawera Collection delivers nationwide and worldwide. Standard delivery takes 2-4 business days across Pakistan."
      }
    },
    {
      "@type": "Question",
      name: "Can I return or exchange this product?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we offer an easy return and exchange policy. Please see our return & exchange policy for full details."
      }
    },
    {
      "@type": "Question",
      name: `How much does the ${product.name} cost?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The price is PKR ${product.price}${product.salePrice && product.salePrice > 0 ? `, currently on sale for PKR ${product.salePrice}` : ""}. All prices are in Pakistani Rupees.`
      }
    }
  ]
});
