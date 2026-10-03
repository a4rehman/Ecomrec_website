import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account & Orders",
  description: "Manage your Sawera Collection account — track orders, update profile and view your order history.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/dashboard" }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
