import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Clock, FileText, MessageCircle } from 'lucide-react';
import { getBookingById, getReviewForBooking } from '@/lib/data/customer-dashboard';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { CancelBookingDialog } from '@/components/shared/cancel-booking-dialog';
import { BookingReviewAction } from '@/components/shared/booking-review-action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Booking details' };

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function BookingDetailPage({ params, searchParams }: BookingDetailPageProps) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const booking = await getBookingById(id);
  if (!booking || booking.customer_id !== user.id) notFound();

  const review = booking.status === 'completed' ? await getReviewForBooking(booking.id) : null;
  const canCancel = ['pending', 'accepted'].includes(booking.status);

  return (
    <div className="max-w-2xl space-y-6">
      {isNew === '1' && (
        <div className="rounded-2xl bg-accent/10 p-4 text-sm text-accent-700">
          Your booking request was sent! The provider typically responds within a few hours.
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{booking.service?.title}</h1>
          <p className="mt-1 text-muted-foreground">with {booking.provider?.business_name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="size-4 text-muted-foreground" />
            {formatDate(booking.scheduled_at, { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-muted-foreground" />
            {booking.duration_minutes} minutes
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              {booking.address_line1}
              {booking.address_line2 ? `, ${booking.address_line2}` : ''}
              <br />
              {booking.city}, {booking.state} {booking.zip_code}
            </span>
          </div>
          {booking.notes && (
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{booking.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service price</span>
            <span>{formatCurrency(booking.price_cents - booking.platform_fee_cents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform fee</span>
            <span>{formatCurrency(booking.platform_fee_cents)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <span>Total</span>
            <span>{formatCurrency(booking.price_cents)}</span>
          </div>
        </CardContent>
      </Card>

      {booking.status === 'cancelled' && booking.cancellation_reason && (
        <Card>
          <CardHeader>
            <CardTitle>Cancellation reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{booking.cancellation_reason}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {booking.provider && (
          <Button asChild variant="outline">
            <Link href={`/dashboard/messages?provider=${booking.provider.id}`}>
              <MessageCircle className="size-4" />
              Message provider
            </Link>
          </Button>
        )}
        {canCancel && <CancelBookingDialog bookingId={booking.id} />}
        {booking.status === 'completed' && !review && booking.provider && (
          <BookingReviewAction
            bookingId={booking.id}
            providerId={booking.provider.id}
            providerName={booking.provider.business_name}
          />
        )}
      </div>
    </div>
  );
}
