'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import type { BookingWithDetails } from '@/lib/data/customer-dashboard';

const tabs: { label: string; value: string | null }[] = [
  { label: 'All', value: null },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function BookingFilterTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get('filter');

  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            if (tab.value) params.set('filter', tab.value);
            else params.delete('filter');
            router.push(`${pathname}?${params.toString()}`);
          }}
          className={cn(
            'border-b-2 px-4 py-2.5 text-sm font-medium',
            active === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function BookingListItem({ booking }: { booking: BookingWithDetails }) {
  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className="flex flex-col gap-4 rounded-2xl border border-border p-5 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-center"
    >
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
        {booking.provider?.logo_url ? (
          <Image
            src={booking.provider.logo_url}
            alt={booking.provider.business_name}
            width={56}
            height={56}
            className="size-full object-cover"
          />
        ) : (
          <span className="font-display text-lg font-semibold">
            {booking.provider?.business_name?.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{booking.service?.title}</p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-muted-foreground">{booking.provider?.business_name}</p>
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

      <div className="text-right">
        <p className="font-display font-semibold">{formatCurrency(booking.price_cents)}</p>
      </div>
    </Link>
  );
}
