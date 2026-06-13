import Link from "next/link";
import { MessageCircle, Send, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white/46 py-14">
      <div className="container-lux grid gap-12 md:grid-cols-[1.15fr_0.7fr_1fr_1.1fr]">
        <section>
          <BrandLogo className="items-start" imageClassName="w-48" showTagline />
          <p className="mt-6 max-w-sm leading-8 text-muted">A luxury feminine fashion house for women, girls, modest fashion buyers, and premium clothing customers.</p>
          <div className="mt-7 flex gap-5 text-accent"><Share2 size={20} /><MessageCircle size={20} /><Send size={20} /></div>
        </section>
        <section>
          <h3 className="tracked-luxury mb-7 text-sm">Quick Links</h3>
          {["Home", "Shop", "New Arrivals", "Collections", "About Us", "Contact"].map((p) => <Link className="mb-4 block text-muted transition hover:text-accent" href={p === "Home" ? "/" : p === "Contact" ? "/contact" : p === "About Us" ? "/about" : "/shop"} key={p}>{p}</Link>)}
        </section>
        <section>
          <h3 className="tracked-luxury mb-7 text-sm">Policies</h3>
          {[
            { name: "Privacy Policy", path: "/privacy-policy" },
            { name: "Return & Exchange", path: "/return-exchange" },
            { name: "Order Cancellation", path: "/order-cancellation" },
            { name: "Terms of Service", path: "/terms-of-service" },
            { name: "Refund Policy", path: "/refund-policy" }
          ].map((p) => <Link className="mb-4 block text-muted transition hover:text-accent" href={p.path} key={p.name}>{p.name}</Link>)}
        </section>
        <section>
          <h3 className="tracked-luxury mb-7 text-sm">Newsletter</h3>
          <p className="mb-6 max-w-sm text-muted">Receive private collection previews, graceful styling notes, and exclusive Sawera offers.</p>
          <div className="flex max-w-md flex-col gap-4"><Input placeholder="E-mail" /><Button variant="outline">Subscribe</Button></div>
          <div className="mt-7 text-sm leading-7 text-muted">
            <p>care@saweracollection.com</p>
            <p>Lahore, Pakistan</p>
          </div>
        </section>
      </div>
      <p className="tracked-luxury mt-16 text-center text-[11px] text-muted">(c) 2026 - Sawera Collection</p>
    </footer>
  );
}
