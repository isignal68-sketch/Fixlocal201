'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { deliverEvent } from '@/lib/automation/emit-event';

export interface RetryEventResult {
  success: boolean;
  message?: string;
}

export async function retryAutomationEventAction(eventId: string): Promise<RetryEventResult> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('automation_events')
    .select('id, event_type, payload, attempts')
    .eq('id', eventId)
    .single();

  if (error || !event) return { success: false, message: 'Event not found.' };

  // A manual retry resets the exhausted state so it gets one more real attempt.
  await deliverEvent(event.id, event.event_type, event.payload, event.attempts + 1);

  revalidatePath('/admin/automations');
  return { success: true };
}
