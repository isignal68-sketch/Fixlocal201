import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser, getProviderBookings } from '@/lib/data/provider-dashboard';
import { ProviderCalendar } from '@/components/shared/provider-calendar';

export const metadata: Metadata = { title: 'Calendar' };

export default async function ProviderCalendarPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const bookings = await getProviderBookings(provider.id);
  const activeBookings = bookings.filter((b) => !['cancelled', 'declined'].includes(b.status));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Calendar</h1>
      <p className="mt-1 text-muted-foreground">All your scheduled bookings at a glance.</p>
      <div className="mt-6">
        <ProviderCalendar bookings={activeBookings} />
      </div>
    </div>
  );
}
