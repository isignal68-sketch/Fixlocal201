import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';
import type { SubscriptionRow, ProviderRow } from '@/types/database';

export const metadata: Metadata = { title: 'Subscriptions' };

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*, provider:providers(business_name, slug)')
    .order('created_at', { ascending: false });

  const subscriptions = ((data ?? []) as unknown as Array<
    SubscriptionRow & { provider: Pick<ProviderRow, 'business_name' | 'slug'> | null }
  >);

  const tierCounts = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.tier] = (acc[s.tier] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Subscriptions</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {['free', 'starter', 'growth', 'pro'].map((tier) => (
          <div key={tier} className="rounded-2xl border border-border p-5">
            <p className="text-sm capitalize text-muted-foreground">{tier}</p>
            <p className="mt-1 font-display text-2xl font-bold">{tierCounts[tier] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Provider</th>
              <th className="px-5 py-3 font-medium">Tier</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Renews</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="px-5 py-4 font-medium">{sub.provider?.business_name ?? '—'}</td>
                <td className="px-5 py-4 capitalize text-muted-foreground">{sub.tier}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {sub.current_period_end ? formatDate(sub.current_period_end) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscriptions.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No paid subscriptions yet.</p>
        )}
      </div>
    </div>
  );
}
