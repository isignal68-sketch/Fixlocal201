import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser, getProviderBookings } from '@/lib/data/provider-dashboard';
import { ProviderBookingListItem } from '@/components/shared/provider-booking-list-item';
import { BookingFilterTabs } from '@/components/shared/booking-list-item';
import { EmptyState } from '@/components/shared/empty-state';

export const metadata: Metadata = { title: 'Bookings' };

interface ProviderBookingsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function ProviderBookingsPage({ searchParams }: ProviderBookingsPageProps) {
  const { filter } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const allBookings = await getProviderBookings(provider.id);

  const filtered = allBookings.filter((b) => {
    if (filter === 'upcoming') return ['pending', 'accepted', 'in_progress'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'declined'].includes(b.status);
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Bookings</h1>
      <div className="mt-6">
        <BookingFilterTabs />
      </div>

      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No bookings here" description="Requests matching this filter will show up here." />
        ) : (
          filtered.map((booking) => <ProviderBookingListItem key={booking.id} booking={booking} />)
        )}
      </div>
    </div>
  );
}
