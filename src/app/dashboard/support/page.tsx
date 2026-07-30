import type { Metadata } from 'next';
import { LifeBuoy } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { createClient } from '@/lib/supabase/server';
import { NewSupportTicketDialog } from '@/components/shared/new-support-ticket-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';
import type { SupportTicketRow } from '@/types/database';

export const metadata: Metadata = { title: 'Support' };

export default async function SupportTicketsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const tickets = (data as SupportTicketRow[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Support</h1>
          <p className="mt-1 text-muted-foreground">Need help? Open a ticket and we&apos;ll get back to you.</p>
        </div>
        <NewSupportTicketDialog />
      </div>

      <div className="mt-6 space-y-3">
        {tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No tickets yet"
            description="When you contact support, your tickets will show up here."
          />
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{ticket.subject}</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                </div>
                <StatusBadge status={ticket.priority} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
