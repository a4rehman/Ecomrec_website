"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/types/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json() as ApiResponse;

      if (!response.ok || !result.ok) {
        setError(result.message || "Could not send OTP.");
        return;
      }

      sessionStorage.setItem("password_reset_email", email.trim().toLowerCase());
      setSuccess(result.message);
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setError("Could not send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container-lux py-24">
      <div className="botanical-panel premium-surface mx-auto max-w-xl p-8 text-center md:p-10">
        <BrandLogo className="relative z-10 mb-8" imageClassName="w-48" showTagline />
        <h1 className="relative z-10 mb-2 font-serif text-4xl">Forgot Password</h1>
        <p className="mb-8 text-muted">Enter your account email and we will send a 6 digit OTP.</p>

        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-6 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

        <form className="relative z-10 grid gap-5 text-left" onSubmit={handleSubmit}>
          <Input placeholder="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending OTP..." : "Send OTP"}</Button>
        </form>
      </div>
    </section>
  );
}
