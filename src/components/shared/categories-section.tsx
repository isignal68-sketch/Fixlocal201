import Link from 'next/link';
import { getCategoryIcon } from '@/lib/category-icons';
import type { CategoryRow } from '@/types/database';

export function CategoriesSection({ categories }: { categories: CategoryRow[] }) {
  return (
    <section className="container py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold">Browse by category</h2>
          <p className="mt-2 text-muted-foreground">Popular services in your area.</p>
        </div>
        <Link href="/categories" className="hidden text-sm font-medium text-primary hover:underline sm:block">
          View all categories →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.slice(0, 12).map((category) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
          View all categories →
        </Link>
      </div>
    </section>
  );
}
