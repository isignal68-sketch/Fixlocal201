import { Star } from 'lucide-react';
import Image from 'next/image';
import { formatDate, initials } from '@/lib/utils';
import { ReportDialog } from '@/components/shared/report-dialog';
import type { ReviewWithCustomer } from '@/lib/data/provider-detail';

export function ReviewsList({ reviews }: { reviews: ReviewWithCustomer[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to book and leave one.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-border pb-6 last:border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                {initials(review.customer_name ?? 'FixLocal customer')}
              </div>
              <div>
                <p className="text-sm font-medium">{review.customer_name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
              </div>
            </div>
            <ReportDialog reviewId={review.id} triggerLabel="Report" />
          </div>

          <div className="mt-3 flex gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={i < review.rating ? 'size-4 fill-current' : 'size-4 text-muted'} />
            ))}
          </div>

          {review.comment && <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>}

          {review.photo_urls.length > 0 && (
            <div className="mt-3 flex gap-2">
              {review.photo_urls.map((url) => (
                <div key={url} className="relative size-16 overflow-hidden rounded-lg">
                  <Image src={url} alt="Review photo" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {review.provider_reply && (
            <div className="mt-3 rounded-xl bg-secondary/60 p-3">
              <p className="text-xs font-medium">Response from the provider</p>
              <p className="mt-1 text-sm text-muted-foreground">{review.provider_reply}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
