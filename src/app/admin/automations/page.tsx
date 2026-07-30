import type { Metadata } from 'next';
import { Zap, CheckCircle2, XCircle, Clock, AlertOctagon } from 'lucide-react';
import { getAutomationEvents, getAutomationStats } from '@/lib/data/admin-automation';
import { AdminFilterTabs } from '@/components/shared/admin-filter-tabs';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { RetryEventButton } from '@/components/shared/retry-event-button';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Automations' };

interface AdminAutomationsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminAutomationsPage({ searchParams }: AdminAutomationsPageProps) {
  const { status } = await searchParams;
  const [events, stats] = await Promise.all([getAutomationEvents(status), getAutomationStats()]);

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-semibold">Automations</h1>
        <p className="mt-1 text-muted-foreground">
          Events dispatched to n8n for user, booking, payment, review, and support workflows.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Delivered" value={String(stats.delivered)} icon={CheckCircle2} />
        <StatCard label="Pending" value={String(stats.pending)} icon={Clock} />
        <StatCard label="Failed (retrying)" value={String(stats.failed)} icon={XCircle} />
        <StatCard label="Exhausted" value={String(stats.exhausted)} icon={AlertOctagon} />
      </div>

      <div className="mt-6">
        <AdminFilterTabs
          paramName="status"
          options={[
            { label: 'All', value: null },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Pending', value: 'pending' },
            { label: 'Failed', value: 'failed' },
            { label: 'Exhausted', value: 'exhausted' },
          ]}
        />
      </div>

      <div className="mt-6">
        {events.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No automation events yet"
            description="Events will appear here as users register, book, pay, and message."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Event</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Attempts</th>
                  <th className="px-5 py-3 font-medium">Last error</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-5 py-4 font-mono text-xs font-medium">{event.event_type}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {event.attempts} / {event.max_attempts}
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-xs text-muted-foreground">
                      {event.last_error ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(event.created_at, { hour: 'numeric', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {(event.status === 'failed' || event.status === 'exhausted') && (
                        <RetryEventButton eventId={event.id} />
                      )}
                    </td>
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
