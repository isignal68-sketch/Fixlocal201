'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/admin/log-action';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

export interface ModerationActionResult {
  success: boolean;
  message?: string;
}

export async function resolveReportAction(
  reportId: string,
  status: 'resolved' | 'dismissed'
): Promise<ModerationActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('resolve_report', 'reports', reportId, { status });
  revalidatePath('/admin/reports');
  return { success: true };
}

export async function updateSupportTicketAction(
  ticketId: string,
  status: 'open' | 'pending' | 'resolved' | 'closed'
): Promise<ModerationActionResult> {
  const supabase = await createClient();
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId)
    .select('user_id, users:user_id(email)')
    .single();

  if (error || !ticket) return { success: false, message: error?.message ?? 'Could not update ticket.' };

  await logAdminAction('update_support_ticket', 'support_tickets', ticketId, { status });

  const userEmail = (ticket as unknown as { users: { email: string } | null }).users?.email ?? '';
  await emitAutomationEvent('support_ticket.updated', { ticketId, status, userEmail });

  revalidatePath('/admin/support');
  return { success: true };
}
