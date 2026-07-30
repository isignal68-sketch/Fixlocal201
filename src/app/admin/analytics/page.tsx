import type { Metadata } from 'next';
import { DollarSign, TrendingUp, Users, Star } from 'lucide-react';
import { getPlatformStats, getPlatformRevenueSeries } from '@/lib/data/admin';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/shared/stat-card';
import { RevenueChart } from '@/components/shared/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Analytics' };

export default async function AdminAnalyticsPage() {
  const [stats, revenueSeries] = await Promise.all([getPlatformStats(), getPlatformRevenueSeries(12)]);

  const supabase = await createClient();
  const { data: categoryBreakdown } = await supabase
    .from('bookings')
    .select('price_cents, service:services(category:categories(name))')
    .eq('status', 'completed');

  const categoryMap = new Map<string, number>();
  for (const row of (categoryBreakdown ?? []) as unknown as Array<{
    price_cents: number;
    service: { category: { name: string } | null } | null;
  }>) {
    const name = row.service?.category?.name ?? 'Other';
    categoryMap.set(name, (categoryMap.get(name) ?? 0) + row.price_cents);
  }
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCategoryRevenue = topCategories[0]?.[1] ?? 1;

  const platformFeeSeries = revenueSeries.map((r) => ({ label: r.label, revenueCents: r.feeCents }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Platform-wide performance metrics.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total GMV" value={formatCurrency(stats.totalRevenueCents)} icon={DollarSign} />
        <StatCard label="This month" value={formatCurrency(stats.monthRevenueCents)} icon={TrendingUp} />
        <StatCard label="Total users" value={stats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Providers" value={stats.totalProviders.toLocaleString()} icon={Star} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gross merchandise value, last 12 months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueSeries.map((r) => ({ label: r.label, revenueCents: r.revenueCents }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform fee revenue, last 12 months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={platformFeeSeries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GMV by category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed bookings yet.</p>
          ) : (
            topCategories.map(([name, revenue]) => (
              <div key={name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">{formatCurrency(revenue)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(revenue / maxCategoryRevenue) * 100}%` }}
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
