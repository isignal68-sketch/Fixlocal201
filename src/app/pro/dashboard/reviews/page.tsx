import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { getProviderReviews } from '@/lib/data/provider-detail';
import { RatingBreakdown } from '@/components/shared/rating-breakdown';
import { ReviewReplyForm } from '@/components/shared/review-reply-form';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate, initials } from '@/lib/utils';

export const metadata: Metadata = { title: 'Reviews' };

export default async function ProviderReviewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const reviews = await getProviderReviews(provider.id, 100);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Reviews</h1>

      {reviews.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Reviews from completed bookings will show up here."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-border p-5">
            <p className="font-display text-3xl font-bold">{provider.average_rating.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">{provider.review_count} reviews</p>
            <div className="mt-4">
              <RatingBreakdown reviews={reviews} />
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                    {initials(review.customer_name ?? 'Customer')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={i < review.rating ? 'size-4 fill-current' : 'size-4 text-muted'}
                    />
                  ))}
                </div>

                {review.comment && <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>}

                {review.provider_reply ? (
                  <div className="mt-3 rounded-xl bg-secondary/60 p-3">
                    <p className="text-xs font-medium">Your response</p>
                    <p className="mt-1 text-sm text-muted-foreground">{review.provider_reply}</p>
                  </div>
                ) : (
                  <ReviewReplyForm reviewId={review.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
