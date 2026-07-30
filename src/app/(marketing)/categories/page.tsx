import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveCategories } from '@/lib/data/providers';
import { getCategoryIcon } from '@/lib/category-icons';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Browse all service categories',
  description: 'Explore every service category available on FixLocal, from plumbing to full home remodels.',
  alternates: { canonical: `${siteConfig.url}/categories` },
};

export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="container py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl font-bold">Browse all categories</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Whatever needs fixing, cleaning, or building — find a vetted pro for it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="size-6" />
              </div>
              <div>
                <p className="font-display font-semibold">{category.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
