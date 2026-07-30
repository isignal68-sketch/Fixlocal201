'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { serviceCategories } from '@/lib/site-config';

const ratingOptions = [4.5, 4, 3.5, 3];
const sortOptions: { value: string; label: string }[] = [
  { value: 'rating', label: 'Highest rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'newest', label: 'Newest' },
];

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeCategory = searchParams.get('category');
  const activeRating = searchParams.get('minRating');
  const activeSort = searchParams.get('sort') ?? 'rating';

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Sort by
        </h3>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', opt.value)}
              className={cn(
                'block w-full rounded-lg px-3 py-2 text-left text-sm',
                activeSort === opt.value
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'hover:bg-secondary'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Minimum rating
        </h3>
        <div className="space-y-1">
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() =>
                updateParam('minRating', activeRating === String(rating) ? null : String(rating))
              }
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm',
                activeRating === String(rating)
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'hover:bg-secondary'
              )}
            >
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {rating}+ stars
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Category
        </h3>
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          <button
            onClick={() => updateParam('category', null)}
            className={cn(
              'block w-full rounded-lg px-3 py-2 text-left text-sm',
              !activeCategory ? 'bg-primary-50 font-medium text-primary-700' : 'hover:bg-secondary'
            )}
          >
            All categories
          </button>
          {serviceCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateParam('category', cat.slug)}
              className={cn(
                'block w-full rounded-lg px-3 py-2 text-left text-sm',
                activeCategory === cat.slug
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'hover:bg-secondary'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
