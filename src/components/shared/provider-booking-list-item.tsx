import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar } from 'lucide-react';
import { formatDate, formatCurrency, initials } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import type { ProviderBookingWithDetails } from '@/lib/data/provider-dashboard';

export function ProviderBookingListItem({ booking }: { booking: ProviderBookingWithDetails }) {
  return (
    <Link
      href={`/pro/dashboard/bookings/${booking.id}`}
      className="flex flex-col gap-4 rounded-2xl border border-border p-5 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-center"
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold">
        {booking.customer?.avatar_url ? (
          <Image
            src={booking.customer.avatar_url}
            alt={booking.customer.full_name}
            width={48}
            height={48}
            className="size-full object-cover"
          />
        ) : (
          initials(booking.customer?.full_name ?? 'Customer')
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{booking.customer?.full_name}</p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-muted-foreground">{booking.service?.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDate(booking.scheduled_at, { hour: 'numeric', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {booking.city}, {booking.state}
          </span>
        </div>
      </div>

      <p className="font-display font-semibold">{formatCurrency(booking.price_cents)}</p>
    </Link>
  );
}
