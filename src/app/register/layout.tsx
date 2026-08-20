import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Sawera Collection account and start shopping premium women's fashion in Pakistan.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/register" }
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
