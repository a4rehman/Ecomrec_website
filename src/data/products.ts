export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: string;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  fabric: string;
  stock: number;
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;

export const products: Product[] = [
  {
    id: "p1",
    slug: "noor-embroidered-lawn-set",
    name: "Noor Embroidered Lawn Set",
    category: "Summer Weaves",
    brand: "Maison Elara",
    price: 189,
    compareAt: 240,
    rating: 4.9,
    reviews: 124,
    badge: "New",
    colors: ["Ivory", "Sage", "Rose"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [img("photo-1539109136881-3be0616acf4b"), img("photo-1515886657613-9f3515b0c78f")],
    description: "A refined embroidered three-piece set with soft tonal detailing and a relaxed formal silhouette.",
    fabric: "Premium lawn with chiffon dupatta",
    stock: 18
  },
  {
    id: "p2",
    slug: "sorine-chiffon-formal",
    name: "Sorine Chiffon Formal",
    category: "Chiffon Threads",
    brand: "Elara Atelier",
    price: 265,
    rating: 4.8,
    reviews: 88,
    badge: "Bestseller",
    colors: ["Black", "Champagne"],
    sizes: ["S", "M", "L"],
    images: [img("photo-1529139574466-a303027c1d8b"), img("photo-1509631179647-0177331693ae")],
    description: "An occasion-ready chiffon ensemble with understated beadwork and a fluid drape.",
    fabric: "Chiffon, silk lining",
    stock: 9
  },
  {
    id: "p3",
    slug: "summer-escape-coord",
    name: "Summer Escape Co-ord",
    category: "Ready To Wear",
    brand: "Maison Elara",
    price: 138,
    compareAt: 172,
    rating: 4.7,
    reviews: 72,
    badge: "Sale",
    colors: ["Sand", "Olive", "White"],
    sizes: ["XS", "S", "M", "L"],
    images: [img("photo-1496747611176-843222e1e57c"), img("photo-1485968579580-b6d095142e6e")],
    description: "A polished daily co-ord cut for movement, office hours, and warm evening plans.",
    fabric: "Cotton viscose blend",
    stock: 26
  },
  {
    id: "p4",
    slug: "amara-unstitched-formal",
    name: "Amara Unstitched Formal",
    category: "Unstitched Formals",
    brand: "Elara Studio",
    price: 215,
    rating: 4.9,
    reviews: 47,
    colors: ["Burgundy", "Pearl"],
    sizes: ["Unstitched"],
    images: [img("photo-1502716119720-b23a93e5fe1b"), img("photo-1469334031218-e382a71b716b")],
    description: "Luxury unstitched fabric with embroidered panels for custom formal tailoring.",
    fabric: "Organza, raw silk, embroidered net",
    stock: 14
  },
  {
    id: "p5",
    slug: "elysian-silk-kurta",
    name: "Elysian Silk Kurta",
    category: "Ready To Wear",
    brand: "Maison Elara",
    price: 178,
    rating: 4.6,
    reviews: 59,
    colors: ["Emerald", "Ivory"],
    sizes: ["S", "M", "L", "XL"],
    images: [img("photo-1539008835657-9e8e9680c956"), img("photo-1551803091-e20673f15770")],
    description: "A minimal silk kurta with architectural cuffs and pearl-finish buttons.",
    fabric: "Silk blend",
    stock: 21
  },
  {
    id: "p6",
    slug: "mira-embroidered-lawn",
    name: "Mira Embroidered Lawn",
    category: "Summer Weaves",
    brand: "Elara Atelier",
    price: 155,
    compareAt: 198,
    rating: 4.8,
    reviews: 96,
    badge: "Limited",
    colors: ["Powder Blue", "Ivory"],
    sizes: ["XS", "S", "M", "L"],
    images: [img("photo-1524504388940-b1c1722653e1"), img("photo-1483985988355-763728e1935b")],
    description: "Lightweight embroidered lawn with a clean neckline and refined summer palette.",
    fabric: "Embroidered lawn",
    stock: 12
  }
];

export const categories = [
  "Chiffon Threads'26",
  "Sorine Summer'26",
  "Summer Escape'26",
  "Summer Weaves Embroidered Lawn'26",
  "Summer Essentials",
  "Unstitched Formals '26",
  "Sale",
  "Ready To Wear"
];

export const testimonials = [
  "Every package feels like opening a private atelier box. The finish is exceptional.",
  "Minimal website, fast checkout, and clothing that photographs beautifully.",
  "The size guide was accurate and the fabric quality feels genuinely premium."
];

export const blogPosts = [
  { slug: "summer-formal-edit", title: "The Summer Formal Edit", category: "Styling", image: img("photo-1543087903-1ac2ec7aa8c5"), excerpt: "How to build a warm-weather occasion wardrobe around texture, restraint, and movement." },
  { slug: "care-for-chiffon", title: "Caring for Chiffon and Lawn", category: "Care", image: img("photo-1515372039744-b8f02a3ae446"), excerpt: "A fabric care guide for keeping embroidered pieces crisp and luminous." },
  { slug: "modern-occasionwear", title: "Modern Occasionwear Codes", category: "Editorial", image: img("photo-1503342217505-b0a15ec3261c"), excerpt: "A quiet-luxury approach to dressing for dinners, weddings, and formal afternoons." }
];
