import { Star } from 'lucide-react';
import type { ReviewRow } from '@/types/database';

export function RatingBreakdown({ reviews }: { reviews: ReviewRow[] }) {
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-2">
      {counts.map(({ star, count }) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="flex w-10 items-center gap-1 text-muted-foreground">
              {star} <Star className="size-3 fill-amber-400 text-amber-400" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
