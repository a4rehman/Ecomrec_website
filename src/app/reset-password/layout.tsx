import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Sawera Collection account.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/reset-password" }
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
