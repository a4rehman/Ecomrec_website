import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/products";
import { breadcrumbSchema, blogSchema, SITE_URL } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CalendarDays, Clock3, UserRound } from "lucide-react";

function readingTime(content: { heading: string; paragraphs: string[] }[]): number {
  const words = content.reduce(
    (total, section) =>
      total +
      section.heading.split(/\s+/).length +
      section.paragraphs.reduce((t, p) => t + p.split(/\s+/).length, 0),
    0
  );
  return Math.max(1, Math.round(words / 200));
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: `${post.title} | Sawera Collection`,
    description: post.excerpt,
    keywords: [post.title.toLowerCase(), post.category.toLowerCase(), "pakistani fashion", "women's fashion blog", "sawera collection"],
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | Sawera Collection`,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      siteName: "Sawera Collection",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Sawera Collection`,
      description: post.excerpt,
      images: [post.image]
    }
  };
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category);
  const relatedPosts = related.length > 0 ? related : blogPosts.filter((p) => p.slug !== post.slug);
  const wordCount = readingTime(post.content) * 200;
  const minutes = readingTime(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      blogSchema({ ...post, wordCount }),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` }
      ])
    ]
  };

  return (
    <article className="container-lux py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` }
        ]}
      />
      <div className="mx-auto max-w-4xl">
        <p className="tracked-luxury text-xs text-accent">{post.category}</p>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">{post.title}</h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[.14em] text-muted">
          <span className="flex items-center gap-2"><UserRound size={14} /> {post.author}</span>
          <span className="flex items-center gap-2"><CalendarDays size={14} /> {formatDate(post.date)}</span>
          <span className="flex items-center gap-2"><Clock3 size={14} /> {minutes} min read</span>
        </div>
      </div>

      <div className="relative my-10 aspect-[16/8]">
        <Image src={post.image} alt={post.title} fill sizes="100vw" priority className="object-cover" />
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[220px_1fr]">
        <nav aria-label="Table of contents" className="hidden md:block">
          <p className="tracked-luxury mb-4 text-xs text-muted">In this article</p>
          <ol className="space-y-2 border-l border-line pl-4 text-sm">
            {post.content.map((section) => (
              <li key={section.heading}>
                <a href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="text-muted transition hover:text-accent">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="text-lg leading-9 text-muted">
          <p className="text-xl leading-9 text-foreground">{post.excerpt}</p>
          {post.content.map((section) => (
            <section key={section.heading}>
              <h2 id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="mt-10 scroll-mt-28 font-serif text-3xl text-foreground">
                {section.heading}
              </h2>
              {section.paragraphs.map((para, idx) => (
                <p key={idx} className="mt-4">{para}</p>
              ))}
            </section>
          ))}
        </div>
      </div>

      <section className="mt-20 border-t border-line pt-12">
        <h2 className="font-serif text-4xl">Related Articles</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {relatedPosts.slice(0, 3).map((b) => (
            <Link href={`/blog/${b.slug}`} key={b.slug} className="group block">
              <div className="lux-sheen relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={b.image} alt={b.title} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <p className="tracked-luxury mt-5 text-xs text-accent">{b.category}</p>
              <h3 className="mt-2 font-serif text-2xl transition group-hover:text-accent">{b.title}</h3>
              <p className="mt-2 text-muted">{b.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
