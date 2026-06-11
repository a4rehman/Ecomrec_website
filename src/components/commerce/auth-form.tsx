import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const title = mode === "login" ? "Login" : mode === "register" ? "Sign Up" : mode === "forgot" ? "Forgot Password" : "Reset Password";
  return <section className="container-lux py-24"><div className="mx-auto max-w-xl text-center"><h1 className="tracked-luxury text-2xl">{title}</h1><p className="mt-7 text-muted">{mode === "login" ? "Enter your email and password to login:" : "Please fill in the information below:"}</p><form className="mt-8 grid gap-5 text-left">{mode === "register" && <div className="grid gap-5 sm:grid-cols-2"><Input placeholder="First name" /><Input placeholder="Last name" /></div>}<Input placeholder="E-mail" />{mode !== "forgot" && <Input placeholder={mode === "reset" ? "New password" : "Password"} type="password" />}{mode === "reset" && <Input placeholder="Confirm password" type="password" />}<Button>{mode === "login" ? "Login" : mode === "register" ? "Create Account" : "Continue"}</Button></form><p className="mt-7 text-muted">{mode === "login" ? <>Don&apos;t have an account? <Link href="/register" className="text-foreground">Sign up</Link></> : <>Already have an account? <Link href="/login" className="text-foreground">Login</Link></>}</p>{mode === "login" && <Link href="/forgot-password" className="mt-4 block text-sm text-muted">Forgot your password?</Link>}</div></section>;
}
