import type { Metadata } from 'next';
import Link from 'next/link';
import { DollarSign, Briefcase, Clock, Star, ArrowRight, Calendar } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import {
  getProviderForUser,
  getProviderStats,
  getProviderRevenueSeries,
  getProviderBookings,
} from '@/lib/data/provider-dashboard';
import { StatCard } from '@/components/shared/stat-card';
import { RevenueChart } from '@/components/shared/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Provider dashboard' };

export default async function ProviderOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const [stats, revenueSeries, pendingBookings] = await Promise.all([
    getProviderStats(provider.id),
    getProviderRevenueSeries(provider.id),
    getProviderBookings(provider.id, 'pending'),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">{provider.business_name}</h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s how your business is doing.</p>
      </div>

      {provider.verification_status !== 'verified' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Your profile is <strong>{provider.verification_status}</strong>. Complete verification
          in{' '}
          <Link href="/pro/dashboard/settings/verification" className="underline">
            Settings
          </Link>{' '}
          to appear in search and start receiving bookings.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="This month" value={formatCurrency(stats.monthRevenueCents)} icon={DollarSign} />
        <StatCard label="Total earned" value={formatCurrency(stats.totalRevenueCents)} icon={Briefcase} />
        <StatCard label="Pending requests" value={String(stats.pendingRequests)} icon={Clock} />
        <StatCard
          label="Rating"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          icon={Star}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue, last 6 months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueSeries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>New booking requests</CardTitle>
          <Link href="/pro/dashboard/bookings" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No pending requests"
              description="New booking requests will show up here for you to accept or decline."
            />
          ) : (
            <div className="space-y-3">
              {pendingBookings.slice(0, 5).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/pro/dashboard/bookings/${booking.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 hover:bg-secondary/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{booking.customer?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.service?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(booking.scheduled_at)}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
