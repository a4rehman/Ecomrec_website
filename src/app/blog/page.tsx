import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/data/products";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Blog",
  description: "Style guides, fabric care tips and fashion editorials from Sawera Collection — premium women's fashion in Pakistan.",
  keywords: ["sawera blog", "lawn styling", "pakistani fashion tips", "fabric care", "eid dressing guide"],
  alternates: { canonical: "https://www.saweracollection.com/blog" },
  openGraph: {
    title: "Blog | Sawera Collection",
    description: "Style guides, fabric care tips and fashion editorials from Sawera Collection.",
    url: "https://www.saweracollection.com/blog",
    type: "website",
    siteName: "Sawera Collection",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sawera Collection Blog" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Sawera Collection",
    description: "Style guides, fabric care tips and fashion editorials from Sawera Collection.",
    images: ["/og-image.jpg"]
  }
};

export default function BlogPage() {
  return <section className="container-lux py-14"><div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="tracked-luxury text-xs text-accent">Journal</p><h1 className="font-serif text-6xl">Blog</h1></div><Input placeholder="Search articles" aria-label="Search articles" className="max-w-sm" /></div><div className="grid gap-8 md:grid-cols-3">{blogPosts.map((b) => <Link href={`/blog/${b.slug}`} key={b.slug} className="group block"><div className="relative aspect-[4/3]"><Image src={b.image} alt={b.title} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" /></div><p className="tracked-luxury mt-5 text-xs text-accent">{b.category}</p><h2 className="mt-2 font-serif text-3xl transition group-hover:text-accent">{b.title}</h2><p className="mt-2 text-muted">{b.excerpt}</p><p className="mt-3 text-xs uppercase tracking-[.14em] text-muted">{new Date(b.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {b.author}</p></Link>)}</div></section>;
}
