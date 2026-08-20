import Link from "next/link";
import { MessageCircle, Send, Share2 } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-panel/60 py-14 backdrop-blur-sm">
      <div className="container-lux grid gap-12 md:grid-cols-[1.15fr_0.7fr_1fr_1.1fr]">
        <section>
          <BrandLogo className="items-start" imageClassName="w-48" showTagline />
          <p className="mt-6 max-w-sm leading-8 text-muted">A luxury feminine fashion house for women, girls, modest fashion buyers, and premium clothing customers.</p>
          <div className="mt-7 flex gap-3 text-accent" aria-label="Sawera Collection on social media">
            <a href="https://www.instagram.com/saweracollection" target="_blank" rel="noopener noreferrer" aria-label="Sawera Collection on Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-line transition hover:bg-foreground hover:text-background" title="Instagram"><Share2 size={18} /></a>
            <a href="https://wa.me/923066378857" target="_blank" rel="noopener noreferrer" aria-label="Chat with Sawera Collection on WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-line transition hover:bg-foreground hover:text-background" title="WhatsApp"><MessageCircle size={18} /></a>
            <a href="https://www.facebook.com/saweracollection" target="_blank" rel="noopener noreferrer" aria-label="Sawera Collection on Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-line transition hover:bg-foreground hover:text-background" title="Facebook"><Send size={18} /></a>
          </div>
        </section>
        <section>
          <h3 className="tracked-luxury mb-7 text-sm">Quick Links</h3>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/">Home</Link>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/shop">Shop</Link>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/shop?category=Luxury%20Lawn">Luxury Lawn</Link>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/shop?category=Festive%20Chiffon">Festive Formals</Link>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/shop?category=Bridal%20%26%20Couture">Bridal &amp; Couture</Link>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/blog">Blog</Link>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/about">About Us</Link>
          <Link className="mb-4 block text-muted transition hover:text-accent" href="/contact">Contact</Link>
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
          <NewsletterForm />
          <div className="mt-7 text-sm leading-7 text-muted">
            <p><a href="mailto:support@saweracollection.com" className="hover:text-accent transition">support@saweracollection.com</a></p>
            <p><a href="https://wa.me/923066378857" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">+92 306 6378857 (WhatsApp)</a></p>
            <p>Lahore, Pakistan</p>
          </div>
        </section>
      </div>
      <p className="tracked-luxury mt-16 text-center text-[11px] text-muted">© 2026 Sawera Collection</p>
    </footer>
  );
}
