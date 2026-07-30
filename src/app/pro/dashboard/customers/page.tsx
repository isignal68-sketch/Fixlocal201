import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser, getProviderCustomers } from '@/lib/data/provider-dashboard';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency, formatDate, initials } from '@/lib/utils';

export const metadata: Metadata = { title: 'Customers' };

export default async function ProviderCustomersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const customers = await getProviderCustomers(provider.id);
  const sorted = [...customers].sort((a, b) => b.totalSpentCents - a.totalSpentCents);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Customers</h1>

      <div className="mt-6">
        {sorted.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Once you complete jobs, your customers will show up here."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3 font-medium">Total spent</th>
                  <th className="px-5 py-3 font-medium">Last booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((c) => (
                  <tr key={c.customerId}>
                    <td className="flex items-center gap-3 px-5 py-4">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                        {initials(c.fullName)}
                      </div>
                      {c.fullName}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{c.totalBookings}</td>
                    <td className="px-5 py-4 font-medium">{formatCurrency(c.totalSpentCents)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(c.lastBookingAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
