"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";
import { EmailSendResult } from "@/types/email";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage("");
    setIsSending(true);

    const res = await fetch("/api/notify/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message, dateTime: new Date().toLocaleString() }),
    });
    const result: EmailSendResult = await res.json();

    setStatusMessage(result.message);
    setIsSending(false);

    if (result.ok) {
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }
  };

  return (
    <section className="container-lux py-14">
      <div className="mb-10">
        <BrandLogo className="mb-6 items-start" imageClassName="w-48" showTagline />
        <h1 className="font-serif text-6xl">Contact Us</h1>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <form className="premium-surface grid gap-4 p-6" onSubmit={handleSubmit}>
          <Input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input placeholder="Phone number" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Textarea placeholder="Message" value={message} onChange={(event) => setMessage(event.target.value)} required />
          {statusMessage && (
            <div className={`rounded border p-3 text-sm ${statusMessage.includes("successfully") ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-800"}`}>
              {statusMessage}
            </div>
          )}
          <Button type="submit" disabled={isSending}>{isSending ? "Sending..." : "Send Message"}</Button>
        </form>
        <div>
          <div className="grid gap-4">
            <p className="flex gap-3">
              <MapPin /> Sawera Collection, 88-B Block, Gulberg III, Lahore, Pakistan
            </p>
            <p className="flex gap-3">
              <a href="https://wa.me/923066378857" target="_blank" rel="noopener noreferrer" className="hover:underline">+92 306 6378857 (WhatsApp Helpline)</a>
            </p>
            <p className="flex gap-3">
              <Mail /> <a href="mailto:support@saweracollection.com" className="hover:underline">support@saweracollection.com</a>
            </p>
            <p className="flex gap-3">
              <Share2 /> @saweracollection
            </p>
          </div>
          <div className="botanical-panel mt-8 aspect-[16/10] rounded-[28px] border border-line bg-[linear-gradient(135deg,#fffaf9,#f4dfe0,#c98386)] p-6 text-foreground">
            <p className="tracked-luxury">Lahore Flagship Studio Map</p>
            <p className="relative z-10 mt-4 max-w-sm text-sm leading-7 text-muted">
              Visit our flagship studio in Gulberg III for fittings, occasion styling, and the latest Sawera Collection edits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
