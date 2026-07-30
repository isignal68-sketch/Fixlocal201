import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Clock, FileText, MessageCircle, Phone } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser, getProviderBookingById } from '@/lib/data/provider-dashboard';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { ProviderBookingActions } from '@/components/shared/provider-booking-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Booking details' };

interface ProviderBookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProviderBookingDetailPage({ params }: ProviderBookingDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const booking = await getProviderBookingById(id);
  if (!booking || booking.provider_id !== provider.id) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{booking.service?.title}</h1>
          <p className="mt-1 text-muted-foreground">for {booking.customer?.full_name}</p>
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
          {booking.customer?.phone && (
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-muted-foreground" />
              {booking.customer.phone}
            </div>
          )}
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
          <CardTitle>Payout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Job total</span>
            <span>{formatCurrency(booking.price_cents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform fee</span>
            <span>-{formatCurrency(booking.platform_fee_cents)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <span>Your payout</span>
            <span>{formatCurrency(booking.price_cents - booking.platform_fee_cents)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/pro/dashboard/messages?customer=${booking.customer_id}`}>
            <MessageCircle className="size-4" />
            Message customer
          </Link>
        </Button>
        <ProviderBookingActions bookingId={booking.id} status={booking.status} />
      </div>
    </div>
  );
}
