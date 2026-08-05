import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved Sawera Collection wishlist — your favourite premium women's fashion pieces, ready to order.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/wishlist" }
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
