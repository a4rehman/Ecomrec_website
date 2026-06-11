import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/data/products";
import { Input } from "@/components/ui/input";

export default function BlogPage() {
  return <section className="container-lux py-14"><div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="tracked-luxury text-xs text-accent">Journal</p><h1 className="font-serif text-6xl">Blog</h1></div><Input placeholder="Search articles" className="max-w-sm" /></div><div className="grid gap-8 md:grid-cols-3">{blogPosts.map((b) => <Link href={`/blog/${b.slug}`} key={b.slug}><div className="relative aspect-[4/3]"><Image src={b.image} alt={b.title} fill sizes="33vw" className="object-cover" /></div><p className="tracked-luxury mt-5 text-xs text-accent">{b.category}</p><h2 className="mt-2 font-serif text-3xl">{b.title}</h2><p className="mt-2 text-muted">{b.excerpt}</p></Link>)}</div></section>;
}
