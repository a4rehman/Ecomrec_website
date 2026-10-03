"use client";

import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { NewsletterForm } from "./newsletter-form";
import { trackSocialClick } from "@/lib/analytics";

/* Authentic Luxury Social Media SVG Icons */
function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 sm:mt-24 border-t border-line bg-panel/70 py-12 sm:py-16 backdrop-blur-md">
      <div className="container-lux grid gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1fr_1.1fr]">
        {/* Brand & Socials */}
        <section className="space-y-4">
          <BrandLogo className="items-start" imageClassName="w-44 sm:w-48" />
          <p className="max-w-sm text-xs sm:text-sm leading-relaxed sm:leading-7 text-muted">
            A luxury feminine fashion house for women, modest fashion buyers, and premium clothing connoisseurs across Pakistan.
          </p>

          <div className="pt-2">
            <p className="text-xs uppercase tracking-wider text-muted font-medium mb-3">Connect with us</p>
            <div className="flex flex-wrap items-center gap-2.5 text-accent" aria-label="Sawera Collection on social media">
              <a
                href="https://www.instagram.com/saweraa_collection/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocialClick("instagram")}
                aria-label="Sawera Collection on Instagram"
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-background text-foreground transition-all duration-300 hover:scale-105 hover:bg-foreground hover:text-background hover:border-foreground focus-ring"
                title="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/people/Sawera-Collection/61590957704524/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocialClick("facebook")}
                aria-label="Sawera Collection on Facebook"
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-background text-foreground transition-all duration-300 hover:scale-105 hover:bg-foreground hover:text-background hover:border-foreground focus-ring"
                title="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/923066378857"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocialClick("whatsapp")}
                aria-label="Chat with Sawera Collection on WhatsApp"
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-background text-foreground transition-all duration-300 hover:scale-105 hover:bg-foreground hover:text-background hover:border-foreground focus-ring"
                title="WhatsApp"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h3 className="tracked-luxury mb-4 sm:mb-6 text-xs sm:text-sm font-semibold text-foreground">Quick Links</h3>
          <nav className="grid gap-2.5 text-xs sm:text-sm text-muted">
            <Link className="transition hover:text-accent" href="/">Home</Link>
            <Link className="transition hover:text-accent" href="/shop">All Collections</Link>
            <Link className="transition hover:text-accent" href="/shop?category=Luxury%20Lawn">Luxury Lawn</Link>
            <Link className="transition hover:text-accent" href="/shop?category=Festive%20Chiffon">Festive Formals</Link>
            <Link className="transition hover:text-accent" href="/shop?category=Bridal%20%26%20Couture">Bridal &amp; Couture</Link>
            <Link className="transition hover:text-accent" href="/blog">Fashion Journal</Link>
            <Link className="transition hover:text-accent" href="/about">About Us</Link>
            <Link className="transition hover:text-accent" href="/contact">Contact &amp; Concierge</Link>
          </nav>
        </section>

        {/* Policies */}
        <section>
          <h3 className="tracked-luxury mb-4 sm:mb-6 text-xs sm:text-sm font-semibold text-foreground">Customer Care</h3>
          <nav className="grid gap-2.5 text-xs sm:text-sm text-muted">
            {[
              { name: "Privacy Policy", path: "/privacy-policy" },
              { name: "Return & Exchange Policy", path: "/return-exchange" },
              { name: "Order Cancellation", path: "/order-cancellation" },
              { name: "Terms of Service", path: "/terms-of-service" },
              { name: "Refund & Refund Policy", path: "/refund-policy" }
            ].map((p) => (
              <Link className="transition hover:text-accent" href={p.path} key={p.name}>
                {p.name}
              </Link>
            ))}
          </nav>
        </section>

        {/* Newsletter & Contact */}
        <section className="space-y-4">
          <h3 className="tracked-luxury mb-2 text-xs sm:text-sm font-semibold text-foreground">Sawera Privé</h3>
          <p className="max-w-sm text-xs sm:text-sm text-muted leading-relaxed">
            Receive private collection previews, graceful styling notes, and exclusive Sawera offers.
          </p>
          <NewsletterForm />
          <div className="pt-2 text-xs sm:text-sm leading-relaxed text-muted space-y-1">
            <p>
              <a href="mailto:support@saweracollection.com" className="hover:text-accent transition">
                support@saweracollection.com
              </a>
            </p>
            <p>
              <a href="https://wa.me/923066378857" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">
                +92 306 6378857 (Helpline)
              </a>
            </p>
            <p>Lahore, Punjab, Pakistan</p>
          </div>
        </section>
      </div>

      <div className="container-lux mt-12 sm:mt-16 pt-6 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-muted">
        <p className="tracked-luxury">© 2026 Sawera Collection. All rights reserved.</p>
        <p className="text-muted">Handcrafted Luxury • Made for Her. Inspired by Grace.</p>
      </div>
    </footer>
  );
}

