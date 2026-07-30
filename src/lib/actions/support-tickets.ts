'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

const createTicketSchema = z.object({
  subject: z.string().trim().min(3, 'Enter a subject').max(150),
  description: z.string().trim().min(10, 'Tell us a bit more').max(2000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export interface SupportTicketActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function createSupportTicketAction(
  input: z.infer<typeof createTicketSchema>
): Promise<SupportTicketActionResult> {
  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { success: false, message: 'You must be signed in.' };

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
    })
    .select('id')
    .single();

  if (error || !ticket) return { success: false, message: error?.message ?? 'Could not submit ticket.' };

  await emitAutomationEvent('support_ticket.created', {
    ticketId: ticket.id,
    userId: user.id,
    userEmail: user.email,
    subject: parsed.data.subject,
    description: parsed.data.description,
    priority: parsed.data.priority,
  });

  revalidatePath('/dashboard/support');
  return { success: true };
}
