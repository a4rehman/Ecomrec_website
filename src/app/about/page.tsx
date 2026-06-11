import Image from "next/image";
import { products } from "@/data/products";

export default function AboutPage() {
  return <section className="container-lux py-14"><div className="grid gap-10 lg:grid-cols-2"><div><p className="tracked-luxury text-xs text-accent">Our Story</p><h1 className="mt-4 font-serif text-7xl">Designed with restraint. Finished with intent.</h1><p className="mt-6 leading-8 text-muted">Maison Elara blends formal South Asian craftsmanship with modern ecommerce clarity: precise navigation, elegant editorial imagery, and confident product storytelling.</p></div><div className="relative min-h-[520px]"><Image src={products[1].images[0]} alt="Maison Elara atelier" fill sizes="50vw" className="object-cover" /></div></div><div className="mt-20 grid gap-6 md:grid-cols-3">{["Mission: make premium occasionwear feel effortless.", "Vision: a global wardrobe house for refined women.", "Team: designers, stylists, makers, and commerce operators."].map((t) => <div className="glass p-7" key={t}>{t}</div>)}</div></section>;
}
