import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { Analytics } from "@vercel/analytics/next";

const sans = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

const siteUrl = "https://www.saweracollection.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sawera Collection | Premium Women's Fashion Pakistan",
    template: "%s | Sawera Collection"
  },
  description: "Sawera Collection — Shop premium women's fashion, luxury lawn, festive & formal wear in Pakistan. Free delivery on orders above PKR 2000. Shop now at saweracollection.com",
  keywords: ["women fashion pakistan", "lawn suits", "formal wear", "luxury collection", "sawera collection", "pakistani dresses", "online shopping pakistan", "stitched suits"],
  authors: [{ name: "Sawera Collection" }],
  creator: "Sawera Collection",
  publisher: "Sawera Collection",
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
    title: "Sawera Collection | Premium Women's Fashion Pakistan",
    description: "Shop premium women's fashion, luxury lawn, festive & formal wear in Pakistan. Free delivery on orders above PKR 2000.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sawera Collection - Premium Women's Fashion" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sawera Collection | Premium Women's Fashion Pakistan",
    description: "Shop premium women's fashion, luxury lawn, festive & formal wear in Pakistan.",
    images: ["/og-image.jpg"]
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg"
  },
  alternates: {
    canonical: siteUrl
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
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
