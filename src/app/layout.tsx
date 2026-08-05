import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { Analytics } from "@vercel/analytics/next";
import { organizationSchema, websiteSchema } from "@/lib/seo";

const sans = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

const siteUrl = "https://www.saweracollection.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pakistani Women's Suits Online | Lawn, Cotton & 3 Piece Suits | Sawera Collection",
    template: "%s | Sawera Collection"
  },
  description: "Shop premium Pakistani women's lawn suits, embroidered dresses, cotton suits & 3-piece collections with delivery across Pakistan.",
  keywords: ["pakistani women's suits", "lawn suits pakistan", "3 piece lawn suit", "cotton suits for women", "embroidered lawn suits", "ready to wear suits", "pakistani dresses online", "women fashion pakistan", "luxury collection", "sawera collection"],
  authors: [{ name: "Sawera Collection" }],
  creator: "Sawera Collection",
  publisher: "Sawera Collection",
  verification: {
    google: "No25eAQCPUZaYStZfV7k7UufgSbwsr_Rsal5jVmicPA"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "Sawera Collection",
    title: "Pakistani Women's Suits Online | Lawn, Cotton & 3 Piece Suits | Sawera Collection",
    description: "Shop premium Pakistani women's lawn suits, embroidered dresses, cotton suits & 3-piece collections with delivery across Pakistan.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sawera Collection - Pakistani Women's Suits" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pakistani Women's Suits Online | Sawera Collection",
    description: "Shop premium Pakistani women's lawn suits, embroidered dresses, cotton suits & 3-piece collections with delivery across Pakistan.",
    images: ["/og-image.jpg"]
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/sawera-logo.png"
  },
  alternates: {
    canonical: siteUrl
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Providers>
          <Header />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
