import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, Briefcase, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { getPlatformStats, getPlatformRevenueSeries } from '@/lib/data/admin';
import { StatCard } from '@/components/shared/stat-card';
import { RevenueChart } from '@/components/shared/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin overview' };

export default async function AdminOverviewPage() {
  const [stats, revenueSeries] = await Promise.all([getPlatformStats(), getPlatformRevenueSeries(12)]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Platform overview</h1>
        <p className="mt-1 text-muted-foreground">A snapshot of FixLocal right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Providers" value={stats.totalProviders.toLocaleString()} icon={Briefcase} />
        <StatCard label="Bookings" value={stats.totalBookings.toLocaleString()} icon={Calendar} />
        <StatCard label="Revenue (all time)" value={formatCurrency(stats.totalRevenueCents)} icon={DollarSign} />
      </div>

      {(stats.pendingVerifications > 0 || stats.openReports > 0 || stats.openTickets > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.pendingVerifications > 0 && (
            <Link
              href="/admin/providers?status=pending"
              className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <AlertTriangle className="size-5 shrink-0" />
              {stats.pendingVerifications} provider{stats.pendingVerifications === 1 ? '' : 's'} awaiting
              verification
            </Link>
          )}
          {stats.openReports > 0 && (
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            >
              <AlertTriangle className="size-5 shrink-0" />
              {stats.openReports} open report{stats.openReports === 1 ? '' : 's'}
            </Link>
          )}
          {stats.openTickets > 0 && (
            <Link
              href="/admin/support"
              className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
            >
              <AlertTriangle className="size-5 shrink-0" />
              {stats.openTickets} open support ticket{stats.openTickets === 1 ? '' : 's'}
            </Link>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Platform revenue, last 12 months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueSeries.map((r) => ({ label: r.label, revenueCents: r.revenueCents }))} />
        </CardContent>
      </Card>
    </div>
  );
}
