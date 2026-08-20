"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lead as trackLead } from "@/lib/metaPixel";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    trackLead();
    setMessage("Thank you for subscribing!");
    setEmail("");
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        type="email"
        name="email"
        autoComplete="email"
        aria-label="Email address"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button variant="outline" type="submit">
        Subscribe
      </Button>
      {message && <p className="text-xs text-accent" role="status">{message}</p>}
    </form>
  );
}
