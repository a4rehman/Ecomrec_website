import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Sawera Collection admin dashboard for managing products, orders and users.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/admin" }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
