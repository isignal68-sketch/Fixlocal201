import type { Metadata } from 'next';
import { getAllBookings } from '@/lib/data/admin';
import { AdminFilterTabs } from '@/components/shared/admin-filter-tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Bookings' };

interface AdminBookingsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const { status } = await searchParams;
  const bookings = await getAllBookings(status);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Bookings</h1>

      <div className="mt-6">
        <AdminFilterTabs
          paramName="status"
          options={[
            { label: 'All', value: null },
            { label: 'Pending', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ]}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Provider</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="px-5 py-4 font-medium">{b.customer_name}</td>
                <td className="px-5 py-4 text-muted-foreground">{b.provider_name}</td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(b.scheduled_at)}</td>
                <td className="px-5 py-4">{formatCurrency(b.price_cents)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No bookings found.</p>
        )}
      </div>
    </div>
  );
}
