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

export const metadata: Metadata = {
  title: { default: "Sawera Collection | Made for Her. Inspired by Grace", template: "%s | Sawera Collection" },
  description: "Premium women's fashion and elegant collections designed for modern women.",
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    title: "Sawera Collection | Made for Her. Inspired by Grace",
    description: "Premium women's fashion and elegant collections designed for modern women.",
    type: "website"
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
