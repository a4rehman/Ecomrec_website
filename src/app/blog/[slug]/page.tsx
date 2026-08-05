import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/products";
import { breadcrumbSchema, blogSchema, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | Sawera Collection`,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      images: [{ url: post.image, alt: post.title }]
    }
  };
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      blogSchema(post),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` }
      ])
    ]
  };

  return <article className="container-lux py-14">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <p className="tracked-luxury text-xs text-accent">{post.category}</p><h1 className="mt-4 max-w-4xl font-serif text-7xl">{post.title}</h1><div className="relative my-10 aspect-[16/8]"><Image src={post.image} alt={post.title} fill sizes="100vw" className="object-cover" /></div><div className="mx-auto max-w-3xl text-lg leading-9 text-muted"><p>{post.excerpt}</p><p className="mt-6">Premium ecommerce content should feel useful, elegant, and direct. This article demonstrates a production-ready single blog layout with SEO-friendly routing and responsive editorial imagery.</p></div></article>;
}
