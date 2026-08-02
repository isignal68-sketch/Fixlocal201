import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { verifySignature } from '@/lib/automation/signing';

export const runtime = 'nodejs';

/**
 * Every action an n8n workflow is allowed to perform back in FixLocal is
 * listed explicitly here with its own validation schema. This is a
 * deliberate allow-list, NOT a generic "run arbitrary SQL" endpoint —
 * n8n should never be able to do more than these specific, safe writes.
 */
const inboundActionSchemas = {
  // AI (OpenAI, via n8n) classified an open support ticket's priority/urgency.
  classify_support_ticket: z.object({
    ticketId: z.string().uuid(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    suggestedReply: z.string().max(4000).optional(),
  }),
  // SMS delivery confirmation from Twilio (via n8n), logged for observability.
  sms_delivery_status: z.object({
    bookingId: z.string().uuid().optional(),
    to: z.string(),
    status: z.enum(['delivered', 'failed', 'undelivered']),
  }),
  // A Google Calendar event was created for a booking; store the event id
  // so a future workflow run can update/cancel the same calendar entry.
  calendar_event_linked: z.object({
    bookingId: z.string().uuid(),
    googleCalendarEventId: z.string(),
  }),
  // OpenAI-generated suggested reply to a customer review, for the provider
  // to review and post (never auto-posted).
  review_reply_suggested: z.object({
    reviewId: z.string().uuid(),
    suggestedReply: z.string().max(2000),
  }),
} as const;

type InboundAction = keyof typeof inboundActionSchemas;

async function handleAction(action: InboundAction, payload: unknown): Promise<{ ok: boolean; message?: string }> {
  const supabase = createAdminClient();

  switch (action) {
    case 'classify_support_ticket': {
      const data = inboundActionSchemas.classify_support_ticket.parse(payload);
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority: data.priority })
        .eq('id', data.ticketId);
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    }

    case 'sms_delivery_status': {
      // Logged via automation_inbound_events only — no additional write
      // needed; kept as an explicit case for auditability and future use
      // (e.g. flagging bookings with undeliverable customer numbers).
      return { ok: true };
    }

    case 'calendar_event_linked': {
      const data = inboundActionSchemas.calendar_event_linked.parse(payload);
      const { error } = await supabase
        .from('bookings')
        .update({ notes: `Google Calendar event: ${data.googleCalendarEventId}` })
        .eq('id', data.bookingId);
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    }

    case 'review_reply_suggested': {
      // Intentionally does NOT write directly to reviews.provider_reply —
      // suggestions are surfaced to the provider (via a notification) for
      // them to approve, never auto-posted on their behalf.
      const data = inboundActionSchemas.review_reply_suggested.parse(payload);
      const { data: review } = await supabase
        .from('reviews')
        .select('provider_id, providers(user_id)')
        .eq('id', data.reviewId)
        .single();

      const providerUserId = (review as unknown as { providers: { user_id: string } | null })?.providers
        ?.user_id;

      if (providerUserId) {
        await supabase.from('notifications').insert({
          user_id: providerUserId,
          type: 'system',
          title: 'AI-suggested review reply ready',
          body: data.suggestedReply.slice(0, 140),
          link: '/pro/dashboard/reviews',
        });
      }
      return { ok: true };
    }

    default:
      return { ok: false, message: 'Unknown action' };
  }
}

export async function POST(request: Request) {
  const secret = process.env.N8N_INBOUND_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Inbound webhook not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-n8n-signature');

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const sourceIp = request.headers.get('x-forwarded-for');

  let parsed: { action?: string; payload?: unknown };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = parsed.action;

  if (!action || !(action in inboundActionSchemas)) {
    await supabase.from('automation_inbound_events').insert({
      action: action ?? 'unknown',
      payload: parsed.payload ?? {},
      processed: false,
      error_message: 'Unrecognized action',
      source_ip: sourceIp,
    });
    return NextResponse.json({ error: 'Unrecognized action' }, { status: 400 });
  }

  try {
    const result = await handleAction(action as InboundAction, parsed.payload);

    await supabase.from('automation_inbound_events').insert({
      action,
      payload: parsed.payload ?? {},
      processed: result.ok,
      error_message: result.ok ? null : (result.message ?? 'Unknown error'),
      source_ip: sourceIp,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 422 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed';

    await supabase.from('automation_inbound_events').insert({
      action,
      payload: parsed.payload ?? {},
      processed: false,
      error_message: message,
      source_ip: sourceIp,
    });

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
