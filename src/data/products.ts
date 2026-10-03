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
  salePrice?: number;
  saleEnd?: string; // ISO date string for countdown
  status?: "draft" | "published";
  isActive?: boolean;
  publishedAt?: string;
  sku?: string;
  tags?: string[];
  heroObjectPositionDesktop?: string;
  heroObjectPositionTablet?: string;
  heroObjectPositionMobile?: string;
};

// No hardcoded static products. All products are managed dynamically via Admin and Database.
export const products: Product[] = [];

export const categories = [
  "New Arrivals",
  "Luxury Lawn",
  "Printed Lawn",
  "Festive Chiffon",
  "Everyday Essentials",
  "Bridal & Couture",
  "Winter Festive",
  "Trending",
  "Sale"
];

export function getProductsByBadge(products: Product[], badge: string) {
  return products.filter((p) => p.badge === badge);
}

export function getProductsByCategory(products: Product[], category: string) {
  return products.filter((p) => p.category === category);
}

export const testimonials = [
  "The details on the Shehnaai lehenga are breathtaking. The karigars have done absolute magic with the embroidery.",
  "Highly impressed by the fabric quality of the lawn. The silk dupatta is so soft and drapes elegantly.",
  "Super fast international shipping to the UK! The stitching service was perfectly tailored to my measurements.",
  "The winter khaddar range is incredibly soft and warm. Best purchase this season!",
  "My go-to brand for formal wear. The crepe silk ensemble is absolutely stunning.",
  "The Nilofer Digital Print Lawn is exactly what I needed for Eid. Colors are so vibrant and fabric feels premium!",
  "Ordered the Dilara Gharara set for my sister's wedding - everyone asked where it was from. Pure elegance!"
];

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  author: string;
  date: string;
  content: { heading: string; paragraphs: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "heritage-lawn-edit",
    title: "The Heritage Lawn Edit",
    category: "Styling",
    image: "/home_page_images/hero_banner_1_lavender.jpg",
    excerpt:
      "How to style your luxury lawn sets with statement jewelry and traditional khussas.",
    author: "Sawera Style Desk",
    date: "2026-03-10",
    content: [
      {
        heading: "Why Luxury Lawn Belongs in Every Summer Wardrobe",
        paragraphs: [
          "Luxury lawn is the undisputed hero of Pakistani summer fashion. The fine, breathable cotton weave keeps you comfortable through long sunny days while the delicate resham and thread embroidery elevates even the simplest 3 piece suit into an occasion-ready outfit.",
          "A heritage lawn suit — sold with a printed or embroidered dupatta and matching trouser fabric — gives you the freedom to have it tailored to your exact measurements and silhouette."
        ]
      },
      {
        heading: "Styling with Statement Jewelry",
        paragraphs: [
          "Pair your embroidered lawn suit with statement silver or gold-tone jewelry. Heavy jhumkas or a maang tikka draw the eye to the embroidery on the neckline, while a delicate choker works beautifully with higher collars.",
          "Avoid layering too many accessories on a heavily embroidered suit — let the karigari shine. A single bold piece, like sculptural earrings or a stack of bangles, is enough to complete the look."
        ]
      },
      {
        heading: "Footwear and Finishing Touches",
        paragraphs: [
          "Traditional khussas in a contrasting colour are the natural companion to a heritage lawn edit. For a more modern take, block-heel sandals and a structured clutch keep the outfit polished without competing with the print.",
          "Finish with a sleek bun or low chignon to highlight the neckline, and keep makeup fresh and minimal. The result is an effortlessly graceful look that moves from daytime formals to family gatherings with ease."
        ]
      },
      {
        heading: "Caring for Your Heritage Lawn",
        paragraphs: [
          "Wash your embroidered lawn suit inside out in cold water and store it wrapped in breathable muslin to protect the thread work. If the suit carries heavy tilla or zari borders, dry cleaning is always the safer choice.",
          "With the right care, a heritage lawn suit remains crisp, vibrant, and wearable season after season — making it one of the most rewarding investments in a summer wardrobe."
        ]
      }
    ]
  },
  {
    slug: "caring-for-embellishments",
    title: "Caring for Zari and Chiffon",
    category: "Care",
    image: "/home_page_images/hero_banner_4_royal_black.jpg",
    excerpt:
      "A complete guide to preserving hand-crafted tilla, gota, and dabka work on festive wear.",
    author: "Sawera Collection",
    date: "2026-02-18",
    content: [
      {
        heading: "Understanding Delicate Embellishments",
        paragraphs: [
          "Tilla, gota, and dabka are some of the most beautiful — and most delicate — forms of Pakistani hand embellishment. Tilla uses fine metallic thread, gota involves flat ribbon-like metal trim, and dabka is a springy coiled thread often outlined in resham.",
          "Because these materials are not designed to withstand heavy washing or friction, the way you store and clean your festive pieces decides how many seasons they will last."
        ]
      },
      {
        heading: "Cleaning Embellished Festive Wear",
        paragraphs: [
          "Always dry clean chiffon and silk pieces with heavy zari or tilla work. Tell your dry cleaner about the embellishment so they treat the garment gently and press it on the reverse side.",
          "If a stain appears, resist rubbing it — dab the area with a clean, dry cloth and take the garment to a professional as soon as possible. Never soak an embroidered piece in water."
        ]
      },
      {
        heading: "Storing Chiffon and Zari Pieces",
        paragraphs: [
          "Hang heavy festive wear on padded hangers, or fold it in acid-free tissue and lay it flat in a breathable cotton storage bag. Avoid plastic covers, which trap moisture and can dull metallic thread.",
          "Add a small silica gel pack to keep humidity away, and keep embellished pieces away from direct sunlight, which can tarnish tilla over time."
        ]
      },
      {
        heading: "Quick Touch-Ups Between Wears",
        paragraphs: [
          "Between wears, a gentle steam (without touching the embellishment) removes creases and refreshes the fabric. Never iron directly over tilla or gota — the heat will damage the metallic finish.",
          "With these small habits, your most cherished festive outfits will stay as radiant as the day you first wore them."
        ]
      }
    ]
  },
  {
    slug: "evolution-of-peshwas",
    title: "The Evolution of the Peshwas",
    category: "Editorial",
    image: "/home_page_images/hero_banner_3_teal.jpg",
    excerpt:
      "Exploring the historic roots of the flowy South Asian Peshwas silhouette and its modern revival.",
    author: "Sawera Collection",
    date: "2026-01-27",
    content: [
      {
        heading: "A Silhouette Born in Royal Courts",
        paragraphs: [
          "The peshwas — a flowing, ankle-length tunic with a flared skirt and often a trailing length — traces its origins to the royal courts of South Asia, where it was worn over fitted trousers called chooridar. Its graceful drape made it a favourite of aristocrats and, later, of cinema's most glamorous stars.",
          "What makes the peshwas enduring is its architecture: a fitted bodice that flares dramatically from the waist, creating an elegant, statuesque line that flatters every body type."
        ]
      },
      {
        heading: "The Modern Revival",
        paragraphs: [
          "Designers in Pakistan and India have reimagined the peshwas for contemporary wardrobes — shorter hems, structured shoulders, and lighter fabrics make it wearable for daytime events, not just weddings.",
          "In today's festive collections, the peshwas appears in everything from luxurious raw silk for mehndi to airy organza for evening formals, always keeping its signature drama intact."
        ]
      },
      {
        heading: "How to Style a Modern Peshwas",
        paragraphs: [
          "For an evening reception, pair a heavily embellished peshwas with statement chandelier earrings and a sleek clutch. A sheer dupatta pinned to one shoulder lets the silhouette flow freely.",
          "For a daytime Mehndi, choose a lighter organza or silk peshwas in citrus tones — marigold, lime, or coral — paired with floral jewelry and delicate heels for an effortless, romantic look."
        ]
      },
      {
        heading: "Why It Remains a Timeless Choice",
        paragraphs: [
          "Few garments flatter as universally as the peshwas. Its regal proportions create movement with every step, making it a silhouette that never feels dated, only enduringly majestic."
        ]
      }
    ]
  },
  {
    slug: "eid-dressing-guide",
    title: "Eid Dressing: A Complete Guide",
    category: "Editorial",
    image: "/home_page_images/hero_banner_2_crimson.jpg",
    excerpt:
      "From sehri to Eid night, a curated style guide for every occasion of the festive season.",
    author: "Sawera Collection",
    date: "2025-09-30",
    content: [
      {
        heading: "Planning Your Eid Wardrobe",
        paragraphs: [
          "Eid is a celebration of togetherness, and dressing for it should feel joyful, not stressful. The key is to plan a small capsule of outfits that carry you from the Eid prayer to family dinners and evening visits.",
          "Start with one statement outfit for Eid morning — a heavy embroidered suit in a festive colour — then build supporting looks that can be mixed and matched for the days that follow."
        ]
      },
      {
        heading: "Eid Morning: Elegance and Comfort",
        paragraphs: [
          "For the Eid prayer, choose breathable luxury lawn or a lightweight festive chiffon that is elegant yet comfortable to sit and stand in. Embroidered edges and a flowing dupatta add polish without heaviness.",
          "Pastel tones and soft florals read beautifully in daylight, while deeper jewel tones feel rich and celebratory."
        ]
      },
      {
        heading: "Family Visits and Eid Night",
        paragraphs: [
          "For visiting family, a printed lawn or co-ord set offers ease and style. Add statement jewelry and a contrasting dupatta to lift the look.",
          "For Eid night gatherings, bring out your heaviest festive wear — tilla, gota, or dabka work under warm lights is magical. Chiffon and organza float beautifully in evening air."
        ]
      },
      {
        heading: "Makeup, Hair, and Finishing Touches",
        paragraphs: [
          "Keep makeup fresh and luminous — soft glam suits festive occasions better than heavy contour. A neat bun or sleek ponytail frames embroidered necklines perfectly.",
          "Finish with fragrance and understated accessories, and let your outfit carry the celebration. Eid is about joy — dress for it, and it will show."
        ]
      }
    ]
  }
];
