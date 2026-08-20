"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/store";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiResponse, AuthUser } from "@/types/auth";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<"register" | "password_reset">("password_reset");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const purposeParam = searchParams.get("purpose");
    const emailParam = searchParams.get("email") || sessionStorage.getItem("password_reset_email") || "";
    setPurpose(purposeParam === "register" ? "register" : "password_reset");
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
        body: JSON.stringify({ email, otp, purpose })
      });
      const result = await response.json() as ApiResponse<AuthUser | { resetToken: string }>;

      if (!response.ok || !result.ok || !result.data) {
        setError(result.message || "OTP verification failed.");
        return;
      }

      if (purpose === "register") {
        const user = result.data as AuthUser;
        dispatch(loginUser(user));
        localStorage.setItem("jahanara_user", JSON.stringify(user));
        router.push("/shop");
        return;
      }

      const resetToken = (result.data as { resetToken: string }).resetToken;
      sessionStorage.setItem("password_reset_email", email.trim().toLowerCase());
      sessionStorage.setItem("password_reset_token", resetToken);
      router.push("/reset-password");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json() as ApiResponse;

      if (!response.ok || !result.ok) {
        setError(result.message || "Could not resend OTP.");
        return;
      }

      setInfo("A new verification code has been sent to your email.");
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setError("Could not resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="container-lux py-24">
      <div className="botanical-panel premium-surface mx-auto max-w-xl p-8 text-center md:p-10">
        <BrandLogo className="relative z-10 mb-8" imageClassName="w-48" showTagline />
        <h1 className="relative z-10 mb-2 font-serif text-4xl">Verify OTP</h1>
        <p className="mb-8 text-muted">
          {purpose === "register"
            ? "Enter the 6 digit code sent to your email to activate your account. It expires in 10 minutes."
            : "Enter the 6 digit code sent to your email. It expires in 10 minutes."}
        </p>

        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {info && <div className="mb-6 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{info}</div>}

        <form className="relative z-10 grid gap-5 text-left" onSubmit={handleSubmit}>
          <Input placeholder="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input placeholder="6 digit OTP" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify OTP"}</Button>
        </form>

        {purpose === "register" && (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="mt-6 text-sm text-accent underline disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        )}
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
