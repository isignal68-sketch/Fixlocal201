import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { blogPosts, getBlogPostBySlug } from '@/lib/blog-data';
import { siteConfig } from '@/lib/site-config';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${siteConfig.url}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="container max-w-2xl py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-primary">
        {post.category}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{post.readTime}</p>

      <div className="prose prose-slate mt-10 max-w-none space-y-5 dark:prose-invert">
        {post.body.map((paragraph, i) => (
          <p key={i} className="text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
