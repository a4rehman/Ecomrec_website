"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/types/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem("password_reset_email") || "");
    setResetToken(sessionStorage.getItem("password_reset_token") || "");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!resetToken) {
      setError("Reset session expired. Please request a new OTP.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, password })
      });
      const result = await response.json() as ApiResponse;

      if (!response.ok || !result.ok) {
        setError(result.message || "Password reset failed.");
        return;
      }

      sessionStorage.removeItem("password_reset_email");
      sessionStorage.removeItem("password_reset_token");
      setSuccess(result.message);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      console.error("Password reset failed:", err);
      setError("Password reset failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container-lux py-24">
      <div className="botanical-panel premium-surface mx-auto max-w-xl p-8 text-center md:p-10">
        <BrandLogo className="relative z-10 mb-8" imageClassName="w-48" showTagline />
        <h1 className="relative z-10 mb-2 font-serif text-4xl">Reset Password</h1>
        <p className="mb-8 text-muted">Choose a new password with at least 8 characters, including a letter and a number.</p>

        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-6 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

        <form className="relative z-10 grid gap-5 text-left" onSubmit={handleSubmit}>
          <Input placeholder="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input placeholder="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Input placeholder="Confirm new password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Resetting..." : "Reset Password"}</Button>
        </form>

        <p className="mt-8 text-muted">
          Need a new code? <Link href="/forgot-password" className="text-foreground underline">Request OTP</Link>
        </p>
      </div>
    </section>
  );
}
