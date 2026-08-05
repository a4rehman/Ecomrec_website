export type CategorySeoContent = {
  heading: string;
  paragraphs: string[];
};

export const categorySeoContent: Record<string, CategorySeoContent> = {
  All: {
    heading: "Pakistani Women's Suits Online",
    paragraphs: [
      "Shop the complete Sawera Collection online — premium Pakistani women's suits, from embroidered luxury lawn and printed lawn to festive chiffon, bridal couture and everyday essentials. Every piece is crafted with high-quality fabrics and fine detailing, designed for the modern Pakistani woman.",
      "Whether you are looking for a 3 piece lawn suit for summer, a heavy embroidered dress for Eid, or a ready to wear suit for daily elegance, Sawera Collection delivers nationwide with easy returns and secure payment options."
    ]
  },
  "Luxury Lawn": {
    heading: "Luxury Lawn Suits for Women in Pakistan",
    paragraphs: [
      "Our luxury lawn collection is the heart of Pakistani summer fashion. Crafted from premium breathable lawn with intricate resham and thread embroidery, each 3 piece luxury lawn suit comes with a printed or embroidered dupatta and matching trouser fabric.",
      "Luxury lawn suits are perfect for daytime formals, family gatherings and summer weddings. The fine weave keeps you cool while the heavy embellishments add an elegant, dressy finish. Every suit is available in multiple colours and both unstitched and stitched options.",
      "Shop online for luxury lawn suits in Pakistan with nationwide delivery. Pair them with statement jewellery and traditional khussas for a complete, graceful look."
    ]
  },
  "Printed Lawn": {
    heading: "Printed Lawn Suits Online",
    paragraphs: [
      "Printed lawn suits are the easiest way to stay stylish and comfortable during the hot season. Our printed lawn collection features fresh digital prints, floral patterns and classic block prints on soft, breathable cotton lawn fabric.",
      "Each printed 3 piece suit includes embroidered or printed trouser fabric and a matching dupatta, making it a complete outfit ready to wear. Ideal for daily wear, college, work and casual outings, these suits offer unbeatable value and comfort.",
      "Explore our range of printed lawn suits for women online and enjoy fast delivery across Pakistan."
    ]
  },
  "Festive Chiffon": {
    heading: "Festive Chiffon Dresses for Eid & Occasions",
    paragraphs: [
      "Our festive chiffon collection is designed for the celebratory moments — Eid, weddings, engagements and evening gatherings. Flowing chiffon paired with heavy tilla, zari and gota embroidery creates an elegant silhouette that moves beautifully.",
      "Available as 2 and 3 piece suits with embellished dupattas, these festive dresses offer a rich, celebratory look. The lightweight fabric ensures all-night comfort even at the most festive events.",
      "Shop festive chiffon dresses online in Pakistan with express delivery and easy exchange options."
    ]
  },
  "Everyday Essentials": {
    heading: "Everyday Essentials — Cotton & Casual Suits",
    paragraphs: [
      "Comfortable, practical and effortlessly stylish — our everyday essentials include cotton kurtis, co-ords, cambric suits and casual wear for women. Designed for daily life, these pieces are easy to wear and easy to care for.",
      "From block print cotton suits to linen kurtas and khaddar co-ord sets, our everyday collection balances comfort with refined design. Perfect for home, office, errands and casual meetups.",
      "Buy quality cotton suits for women online at Sawera Collection with affordable prices and nationwide shipping."
    ]
  },
  "Bridal & Couture": {
    heading: "Bridal Dresses & Couture Suits for Weddings",
    paragraphs: [
      "Sawera's bridal and couture collection brings you the grandeur of Pakistani wedding fashion — lehengas, ghararas, angrakha gowns and heavily embellished bridal suits crafted for the bride and her family.",
      "Featuring premium silks, organza and raw silk with intricate hand embellishment, each couture piece is a statement of grace. Made to be remembered, these outfits are perfect for weddings, mehndi, baraat and walima events.",
      "Shop bridal and couture dresses online in Pakistan and let Sawera Collection dress your most special moments."
    ]
  },
  "Winter Festive": {
    heading: "Winter Festive Collection — Khaddar & Velvet",
    paragraphs: [
      "Our winter festive collection keeps you elegant through the colder months. Warm khaddar suits, velvet shawls and karandi sets are crafted with festive detailing so you can celebrate in comfort and style.",
      "From embroidered winter suits to velvet shawl sets, each piece blends seasonal warmth with luxurious finishing. Perfect for winter weddings, Eid gatherings and cosy festive evenings.",
      "Shop winter wear for women online in Pakistan with our curated festive collection."
    ]
  },
  Sale: {
    heading: "Sale — Pakistani Suits at Best Prices",
    paragraphs: [
      "Discover unbeatable deals in the Sawera Collection sale — premium Pakistani suits, dresses and co-ord sets at reduced prices. Enjoy luxury lawn, printed lawn and ready to wear styles for less.",
      "Sale items are limited in stock and sizes sell out fast, so grab your favourites before they are gone. All sale pieces are brand new and backed by our standard quality guarantee."
    ]
  },
  Trending: {
    heading: "Trending Pakistani Suits & Dresses",
    paragraphs: [
      "Discover what everyone is loving right now — our most popular Pakistani suits and dresses, handpicked by customers. From bestselling luxury lawn to celebrity-inspired festive styles, this is where you will find the season's hottest pieces.",
      "Trending styles change with the season, so check back often to see fresh additions and restocked favourites."
    ]
  }
};

export function getCategorySeoContent(category: string): CategorySeoContent | null {
  return categorySeoContent[category] || null;
}
