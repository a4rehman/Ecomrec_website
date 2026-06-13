"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ApiResponse, AuthUser } from "@/types/auth";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/shop";
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const title = mode === "login" ? "Login" : mode === "register" ? "Sign Up" : mode === "forgot" ? "Forgot Password" : "Reset Password";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (mode === "login") {
      if (!password) {
        setError("Password is required.");
        return;
      }

      // 1. Admin login check
      if (email.toLowerCase() === "admin@saweracollection.com" && password === "admin") {
        const adminUser = { id: "admin-demo", email: "admin@saweracollection.com", name: "Administrator", role: "admin" as const };
        dispatch(loginUser(adminUser));
        localStorage.setItem("jahanara_user", JSON.stringify(adminUser));
        router.push("/admin");
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json() as ApiResponse<AuthUser>;

      if (!response.ok || !result.ok || !result.data) {
        setError(result.message || "Invalid email or password.");
        return;
      }

      dispatch(loginUser(result.data));
      localStorage.setItem("jahanara_user", JSON.stringify(result.data));
      router.push(redirectTo);
    } else if (mode === "register") {
      if (!firstName || !lastName) {
        setError("First and last name are required.");
        return;
      }
      if (!password) {
        setError("Password is required.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password })
      });
      const result = await response.json() as ApiResponse<AuthUser>;

      if (!response.ok || !result.ok || !result.data) {
        setError(result.message || "Could not create your account.");
        return;
      }

      dispatch(loginUser(result.data));
      localStorage.setItem("jahanara_user", JSON.stringify(result.data));
      router.push("/shop");
    } else if (mode === "forgot") {
      router.push("/forgot-password");
    } else if (mode === "reset") {
      router.push("/reset-password");
    }
  };

  return (
    <section className="container-lux py-24">
      <div className="botanical-panel premium-surface mx-auto max-w-xl p-8 text-center md:p-10">
        <BrandLogo className="relative z-10 mb-8" imageClassName="w-48" showTagline />
        <h1 className="relative z-10 mb-2 font-serif text-4xl">{title}</h1>
        <p className="text-muted mb-8">
          {mode === "login" ? "Enter your credentials to access your Sawera account:" : "Create your Sawera profile for graceful shopping."}
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
            {success}
          </div>
        )}

        <form className="relative z-10 grid gap-5 text-left" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          )}
          
          <Input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          
          {mode !== "forgot" && (
            <Input placeholder={mode === "reset" ? "New password" : "Password"} type="password" value={password} onChange={e => setPassword(e.target.value)} />
          )}
          
          {mode === "register" && (
            <Input placeholder="Confirm password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          )}

          <Button type="submit">
            {mode === "login" ? "Login" : mode === "register" ? "Create Account" : "Continue"}
          </Button>
        </form>

        <p className="mt-8 text-muted">
          {mode === "login" ? (
            <>Don&apos;t have an account? <Link href="/register" className="text-foreground underline">Sign up</Link><br /><Link href="/forgot-password" className="mt-2 inline-block text-foreground underline">Forgot password?</Link></>
          ) : (
            <>Already have an account? <Link href="/login" className="text-foreground underline">Login</Link></>
          )}
        </p>
      </div>
    </section>
  );
}
