import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, searchProviders, getActiveCategories } from '@/lib/data/providers';
import { getCategoryIcon } from '@/lib/category-icons';
import { ProviderCard } from '@/components/shared/provider-card';
import { siteConfig } from '@/lib/site-config';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await getActiveCategories();
    return categories.map((category) => ({ slug: category.slug }));
  } catch (error) {
    // If Supabase env vars aren't available at build time (or the DB is
    // briefly unreachable), don't fail the entire build over pre-rendering
    // an SEO optimization — fall back to zero statically generated category
    // pages. `dynamicParams` defaults to true, so every category page still
    // renders correctly on first request; it just isn't pre-built.
    console.warn('generateStaticParams (categories) failed, falling back to on-demand rendering:', error);
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return {};

  return {
    title: `${category.name} services near you`,
    description: `Find and book trusted ${category.name.toLowerCase()} professionals. ${category.description ?? ''}`,
    alternates: { canonical: `${siteConfig.url}/categories/${category.slug}` },
  };
}

export const revalidate = 1800;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const { providers, total } = await searchProviders({ categorySlug: slug, perPage: 24 });
  const Icon = getCategoryIcon(category.icon);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: category.name,
    provider: { '@type': 'Organization', name: siteConfig.name },
    areaServed: 'US',
  };

  return (
    <div className="container py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-10 flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary">
          <Icon className="size-7" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{category.name} near you</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {total} verified {category.name.toLowerCase()} provider{total === 1 ? '' : 's'} available
      </p>

      {providers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="font-medium">No providers yet in this category.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon, or{' '}
            <Link href="/pro/join" className="text-primary hover:underline">
              join as a provider
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
