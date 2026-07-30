import type { Metadata } from 'next';
import { LifeBuoy } from 'lucide-react';
import { getSupportTickets } from '@/lib/data/admin';
import { AdminFilterTabs } from '@/components/shared/admin-filter-tabs';
import { TicketStatusSelect } from '@/components/shared/ticket-status-select';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Support' };

interface AdminSupportPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSupportPage({ searchParams }: AdminSupportPageProps) {
  const { status } = await searchParams;
  const tickets = await getSupportTickets(status);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Support tickets</h1>

      <div className="mt-6">
        <AdminFilterTabs
          paramName="status"
          options={[
            { label: 'All', value: null },
            { label: 'Open', value: 'open' },
            { label: 'Pending', value: 'pending' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Closed', value: 'closed' },
          ]}
        />
      </div>

      <div className="mt-6 space-y-3">
        {tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No tickets" description="No support tickets match this filter." />
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{ticket.subject}</p>
                    <StatusBadge status={ticket.priority} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                </div>
                <TicketStatusSelect ticketId={ticket.id} status={ticket.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
