import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getCustomerReviews } from '@/lib/data/customer-dashboard';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'My reviews' };

export default async function CustomerReviewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const reviews = await getCustomerReviews(user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">My reviews</h1>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="After a completed booking, you can leave a review from your bookings page."
            actionLabel="View bookings"
            actionHref="/dashboard/bookings"
          />
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between">
                <Link
                  href={`/providers/${review.provider?.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {review.provider?.business_name}
                </Link>
                <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
              </div>
              <div className="mt-2 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < review.rating ? 'size-4 fill-current' : 'size-4 text-muted'}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              )}
              {review.provider_reply && (
                <div className="mt-3 rounded-xl bg-secondary/60 p-3">
                  <p className="text-xs font-medium">Response from the provider</p>
                  <p className="mt-1 text-sm text-muted-foreground">{review.provider_reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
