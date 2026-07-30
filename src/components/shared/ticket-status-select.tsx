'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateSupportTicketAction } from '@/lib/actions/admin-moderation';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const STATUSES = ['open', 'pending', 'resolved', 'closed'] as const;

export function TicketStatusSelect({
  ticketId,
  status,
}: {
  ticketId: string;
  status: (typeof STATUSES)[number];
}) {
  const router = useRouter();

  async function handleChange(value: string) {
    const result = await updateSupportTicketAction(ticketId, value as (typeof STATUSES)[number]);
    if (!result.success) {
      toast.error(result.message ?? 'Could not update ticket.');
      return;
    }
    toast.success('Ticket updated');
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
