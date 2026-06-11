import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/products";

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  return <article className="container-lux py-14"><p className="tracked-luxury text-xs text-accent">{post.category}</p><h1 className="mt-4 max-w-4xl font-serif text-7xl">{post.title}</h1><div className="relative my-10 aspect-[16/8]"><Image src={post.image} alt={post.title} fill sizes="100vw" className="object-cover" /></div><div className="mx-auto max-w-3xl text-lg leading-9 text-muted"><p>{post.excerpt}</p><p className="mt-6">Premium ecommerce content should feel useful, elegant, and direct. This article demonstrates a production-ready single blog layout with SEO-friendly routing and responsive editorial imagery.</p></div></article>;
}
