import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Star, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getCustomerBookings, getBookingsAwaitingReview } from '@/lib/data/customer-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [upcomingBookings, awaitingReview] = await Promise.all([
    getCustomerBookings(user.id),
    getBookingsAwaitingReview(user.id),
  ]);

  const nextBookings = upcomingBookings
    .filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Welcome back, {user.full_name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening with your bookings.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming bookings</CardTitle>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {nextBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming bookings"
              description="When you book a service, it'll show up here."
              actionLabel="Find a pro"
              actionHref="/search"
            />
          ) : (
            <div className="space-y-3">
              {nextBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {booking.provider?.logo_url ? (
                      <Image
                        src={booking.provider.logo_url}
                        alt={booking.provider.business_name}
                        width={44}
                        height={44}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-sm font-semibold">
                        {booking.provider?.business_name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{booking.service?.title}</p>
                    <p className="text-sm text-muted-foreground">{booking.provider?.business_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(booking.scheduled_at)}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {awaitingReview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {awaitingReview.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-medium">{booking.provider?.business_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.service?.title}</p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/dashboard/bookings/${booking.id}?review=1`}>
                    <Star className="size-4" />
                    Leave review
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
