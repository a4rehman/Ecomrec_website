import Link from "next/link";
import { MessageCircle, Send, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line py-14">
      <div className="container-lux grid gap-12 md:grid-cols-[1fr_0.7fr_1.2fr]">
        <section>
          <h3 className="tracked-luxury mb-7 text-sm">Newsletter</h3>
          <p className="mb-6 max-w-sm text-muted">Sign up to receive private collection previews, styling notes, and exclusive offers.</p>
          <div className="flex max-w-md flex-col gap-4 sm:flex-row"><Input placeholder="E-mail" /><Button variant="outline">Subscribe</Button></div>
          <div className="mt-9 flex gap-7 text-accent"><Share2 size={20} /><MessageCircle size={20} /><Send size={20} /></div>
        </section>
        <section>
          <h3 className="tracked-luxury mb-7 text-sm">Policies</h3>
          {["Privacy Policy", "Return & Exchange", "Order Cancellation", "Custom and Duties", "Terms of Service", "Refund Policy"].map((p) => <Link className="mb-4 block text-muted hover:text-foreground" href="#" key={p}>{p}</Link>)}
        </section>
        <section>
          <h3 className="tracked-luxury mb-7 text-sm">About</h3>
          <p className="max-w-lg leading-8 text-muted">Maison Elara is a formal clothing house built around precise fabric selection, embroidered detail, and a customer-focused approach for feminine, dynamic women.</p>
        </section>
      </div>
      <p className="tracked-luxury mt-16 text-center text-[11px] text-muted">© 2026 - Maison Elara</p>
    </footer>
  );
}
