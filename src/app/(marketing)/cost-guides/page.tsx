import type { Metadata } from 'next';
import Link from 'next/link';
import { serviceCategories } from '@/lib/site-config';
import { getCategoryIcon } from '@/lib/category-icons';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Cost guides',
  description: 'Understand typical pricing for home services before you book.',
  alternates: { canonical: `${siteConfig.url}/cost-guides` },
};

export default function CostGuidesPage() {
  return (
    <div className="container py-16">
      <h1 className="font-display text-4xl font-bold">Cost guides</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Know what to expect before you book. Browse typical pricing ranges by service category.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceCategories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-primary/30"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <Icon className="size-4" />
              </div>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
