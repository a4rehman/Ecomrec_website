import { Mail, MapPin, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function ContactPage() {
  return (
    <section className="container-lux py-14">
      <div className="mb-10">
        <BrandLogo className="mb-6 items-start" imageClassName="w-48" showTagline />
        <h1 className="font-serif text-6xl">Contact Us</h1>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <form className="premium-surface grid gap-4 p-6">
          <Input placeholder="Name" />
          <Input placeholder="E-mail" />
          <Textarea placeholder="Message" />
          <Button>Send Message</Button>
        </form>
        <div>
          <div className="grid gap-4">
            <p className="flex gap-3">
              <MapPin /> Sawera Collection, 88-B Block, Gulberg III, Lahore, Pakistan
            </p>
            <p className="flex gap-3">
              <Phone /> +92 300 1234567 (WhatsApp Helpline)
            </p>
            <p className="flex gap-3">
              <Mail /> care@saweracollection.com
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
