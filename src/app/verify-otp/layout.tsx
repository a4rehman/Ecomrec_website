import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Account",
  description: "Verify your Sawera Collection account with your email OTP.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.saweracollection.com/verify-otp" }
};

export default function VerifyOtpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
