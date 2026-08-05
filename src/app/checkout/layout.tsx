import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely at Sawera Collection with Cash on Delivery and secure payment options.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/checkout" }
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
