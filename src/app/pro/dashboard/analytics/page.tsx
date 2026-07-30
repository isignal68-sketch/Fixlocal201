import type { Metadata } from 'next';
import { DollarSign, Users, Star, Briefcase } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import {
  getProviderForUser,
  getProviderStats,
  getProviderRevenueSeries,
} from '@/lib/data/provider-dashboard';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/shared/stat-card';
import { RevenueChart } from '@/components/shared/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Analytics' };

export default async function ProviderAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const [stats, revenueSeries] = await Promise.all([
    getProviderStats(provider.id),
    getProviderRevenueSeries(provider.id, 12),
  ]);

  const supabase = await createClient();
  const { data: serviceBreakdown } = await supabase
    .from('bookings')
    .select('price_cents, service:services(title)')
    .eq('provider_id', provider.id)
    .eq('status', 'completed');

  const serviceMap = new Map<string, number>();
  for (const row of (serviceBreakdown ?? []) as unknown as Array<{
    price_cents: number;
    service: { title: string } | null;
  }>) {
    const title = row.service?.title ?? 'Other';
    serviceMap.set(title, (serviceMap.get(title) ?? 0) + row.price_cents);
  }
  const topServices = Array.from(serviceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxServiceRevenue = topServices[0]?.[1] ?? 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Track how your business is performing over time.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenueCents)} icon={DollarSign} />
        <StatCard label="Completed jobs" value={String(stats.completedJobs)} icon={Briefcase} />
        <StatCard label="New customers (30d)" value={String(stats.newCustomers30d)} icon={Users} />
        <StatCard
          label="Avg. rating"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          icon={Star}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue, last 12 months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueSeries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top services by revenue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed jobs yet.</p>
          ) : (
            topServices.map(([title, revenue]) => (
              <div key={title}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{title}</span>
                  <span className="text-muted-foreground">{formatCurrency(revenue)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(revenue / maxServiceRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
