"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const title = mode === "login" ? "Login" : mode === "register" ? "Sign Up" : mode === "forgot" ? "Forgot Password" : "Reset Password";

  const handleSubmit = (e: React.FormEvent) => {
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
        const adminUser = { email: "admin@saweracollection.com", name: "Administrator", role: "admin" as const };
        dispatch(loginUser(adminUser));
        localStorage.setItem("sawera_user", JSON.stringify(adminUser));
        router.push("/admin");
        return;
      }

      // 2. Regular user login check
      const storedUsers = localStorage.getItem("sawera_registered_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];
      const matchedUser = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (matchedUser) {
        const userSession = { email: matchedUser.email, name: matchedUser.name, role: "user" as const };
        dispatch(loginUser(userSession));
        localStorage.setItem("sawera_user", JSON.stringify(userSession));
        router.push("/shop");
      } else {
        setError("Invalid email or password.");
      }
    } else if (mode === "register") {
      if (!firstName || !lastName) {
        setError("First and last name are required.");
        return;
      }
      if (!password) {
        setError("Password is required.");
        return;
      }
      if (password.length < 5) {
        setError("Password must be at least 5 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Regular user registration
      const storedUsers = localStorage.getItem("sawera_registered_users");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];
      const userExists = usersList.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        setError("An account with this email already exists.");
        return;
      }

      const name = `${firstName} ${lastName}`;
      const newUser = { email, password, name };
      usersList.push(newUser);
      localStorage.setItem("sawera_registered_users", JSON.stringify(usersList));

      const userSession = { email, name, role: "user" as const };
      dispatch(loginUser(userSession));
      localStorage.setItem("sawera_user", JSON.stringify(userSession));
      router.push("/shop");
    } else if (mode === "forgot") {
      setSuccess("If that account exists, a reset link has been simulated to your inbox!");
    } else if (mode === "reset") {
      setSuccess("Your password has been successfully reset! You can now log in.");
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
            <>Don&apos;t have an account? <Link href="/register" className="text-foreground underline">Sign up</Link></>
          ) : (
            <>Already have an account? <Link href="/login" className="text-foreground underline">Login</Link></>
          )}
        </p>

        {mode === "login" && (
          <div className="relative z-10 mt-4 rounded-3xl border border-line bg-background/50 p-4 text-left text-xs text-muted">
            <p className="font-semibold text-foreground mb-1">Quick Demo Accounts:</p>
            <p>- Admin: <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">admin@saweracollection.com</code> (Password: <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">admin</code>)</p>
            <p>- Customer: Sign up with any email or create one in seconds.</p>
          </div>
        )}
      </div>
    </section>
  );
}
