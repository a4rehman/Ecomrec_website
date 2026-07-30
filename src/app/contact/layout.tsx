import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Sawera Collection. Chat with us on WhatsApp +92 306 6378857 or email support@saweracollection.com for order help, returns & queries.",
  alternates: { canonical: "https://www.saweracollection.com/contact" },
  openGraph: {
    title: "Contact Sawera Collection",
    description: "Chat on WhatsApp +92 306 6378857 or email support@saweracollection.com",
    url: "https://www.saweracollection.com/contact"
  }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
