import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Sawera Collection account password securely.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/forgot-password" }
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
