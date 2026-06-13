"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/types/auth";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email") || sessionStorage.getItem("password_reset_email") || "";
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const result = await response.json() as ApiResponse<{ resetToken: string }>;

      if (!response.ok || !result.ok || !result.data?.resetToken) {
        setError(result.message || "OTP verification failed.");
        return;
      }

      sessionStorage.setItem("password_reset_email", email.trim().toLowerCase());
      sessionStorage.setItem("password_reset_token", result.data.resetToken);
      router.push("/reset-password");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container-lux py-24">
      <div className="botanical-panel premium-surface mx-auto max-w-xl p-8 text-center md:p-10">
        <BrandLogo className="relative z-10 mb-8" imageClassName="w-48" showTagline />
        <h1 className="relative z-10 mb-2 font-serif text-4xl">Verify OTP</h1>
        <p className="mb-8 text-muted">Enter the 6 digit code sent to your email. It expires in 10 minutes.</p>

        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form className="relative z-10 grid gap-5 text-left" onSubmit={handleSubmit}>
          <Input placeholder="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input placeholder="6 digit OTP" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify OTP"}</Button>
        </form>
      </div>
    </section>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<section className="container-lux py-24 text-center">Loading verification...</section>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
