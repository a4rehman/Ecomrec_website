import type { Metadata } from "next";
import { localBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Sawera Collection. Chat with us on WhatsApp +92 306 6378857 or email support@saweracollection.com for order help, returns & queries.",
  keywords: ["contact sawera collection", "sawera whatsapp", "pakistani fashion store lahore", "women fashion customer support"],
  alternates: { canonical: "https://www.saweracollection.com/contact" },
  openGraph: {
    title: "Contact Sawera Collection",
    description: "Chat on WhatsApp +92 306 6378857 or email support@saweracollection.com",
    url: "https://www.saweracollection.com/contact",
    type: "website",
    siteName: "Sawera Collection",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sawera Collection" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Sawera Collection",
    description: "Chat on WhatsApp +92 306 6378857 or email support@saweracollection.com"
  }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      {children}
    </>
  );
}
