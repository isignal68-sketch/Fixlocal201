import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'The FixLocal Blog',
  description: 'Home improvement tips, cost guides, and stories from the FixLocal community.',
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default function BlogPage() {
  return (
    <div className="container max-w-4xl py-16">
      <h1 className="font-display text-4xl font-bold">The FixLocal Blog</h1>
      <p className="mt-4 text-muted-foreground">
        Home improvement tips, cost guides, and stories to help you get the job done right.
      </p>

      <div className="mt-10 space-y-6">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-border p-6 transition-colors hover:border-primary/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {post.category}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="mt-3 text-xs text-muted-foreground">{post.readTime}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
