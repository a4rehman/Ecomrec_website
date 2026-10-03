import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Sawera Collection account to track orders, manage wishlist and enjoy a seamless shopping experience.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/login" }
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
