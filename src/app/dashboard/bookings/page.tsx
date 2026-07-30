import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getCustomerBookings } from '@/lib/data/customer-dashboard';
import { BookingFilterTabs, BookingListItem } from '@/components/shared/booking-list-item';
import { EmptyState } from '@/components/shared/empty-state';

export const metadata: Metadata = { title: 'My bookings' };

interface BookingsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const { filter } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const allBookings = await getCustomerBookings(user.id);

  const filtered = allBookings.filter((b) => {
    if (filter === 'upcoming') return ['pending', 'accepted', 'in_progress'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'declined'].includes(b.status);
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">My bookings</h1>
      <div className="mt-6">
        <BookingFilterTabs />
      </div>

      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings here"
            description="Bookings matching this filter will show up here."
            actionLabel="Find a pro"
            actionHref="/search"
          />
        ) : (
          filtered.map((booking) => <BookingListItem key={booking.id} booking={booking} />)
        )}
      </div>
    </div>
  );
}
