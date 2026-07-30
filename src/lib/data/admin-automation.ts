import { createClient } from '@/lib/supabase/server';
import type { AutomationEventRow, AutomationWebhookDeliveryRow } from '@/types/automation';

export async function getAutomationEvents(status?: string, limit = 100): Promise<AutomationEventRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from('automation_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return [];
  return (data as AutomationEventRow[]) ?? [];
}

export async function getAutomationEventDeliveries(
  eventId: string
): Promise<AutomationWebhookDeliveryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('automation_webhook_deliveries')
    .select('*')
    .eq('event_id', eventId)
    .order('attempt_number', { ascending: true });

  if (error) return [];
  return (data as AutomationWebhookDeliveryRow[]) ?? [];
}

export interface AutomationStats {
  total: number;
  delivered: number;
  failed: number;
  exhausted: number;
  pending: number;
}

export async function getAutomationStats(): Promise<AutomationStats> {
  const supabase = await createClient();
  const { data } = await supabase.from('automation_events').select('status');

  const rows = data ?? [];
  return {
    total: rows.length,
    delivered: rows.filter((r) => r.status === 'delivered').length,
    failed: rows.filter((r) => r.status === 'failed').length,
    exhausted: rows.filter((r) => r.status === 'exhausted').length,
    pending: rows.filter((r) => r.status === 'pending').length,
  };
}
