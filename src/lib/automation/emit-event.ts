import { createAdminClient } from '@/lib/supabase/server';
import { signPayload } from '@/lib/automation/signing';
import type { AutomationEventPayloadMap, AutomationEventType } from '@/lib/automation/event-types';
import type { Json } from '@/types/supabase';

const DELIVERY_TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 6;

/** Exponential backoff: 1m, 2m, 4m, 8m, 16m, 32m (capped), for the retry sweeper to pick up. */
function computeNextRetryDelaySeconds(attemptNumber: number): number {
  return Math.min(60 * 2 ** (attemptNumber - 1), 60 * 60);
}

interface EmitOptions {
  /** Optional dedupe key — if an event with this key already exists, it is not re-emitted. */
  idempotencyKey?: string;
}

/**
 * Emits a domain event toward n8n. This function NEVER throws — automation
 * delivery is a side effect, not a dependency of the calling booking/review/
 * payment action. Every emission is durably logged first, so even a total
 * network failure is recoverable by the retry sweeper
 * (`/api/cron/automation-retry`) rather than silently lost.
 */
export async function emitAutomationEvent<T extends AutomationEventType>(
  eventType: T,
  payload: AutomationEventPayloadMap[T],
  options: EmitOptions = {}
): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { data: event, error: insertError } = await supabase
      .from('automation_events')
      .insert({
        event_type: eventType,
        payload: payload as unknown as Json,
        idempotency_key: options.idempotencyKey ?? null,
        max_attempts: MAX_ATTEMPTS,
      })
      .select('id, event_type, payload, attempts, max_attempts')
      .single();

    // A conflict on idempotency_key means this exact event was already
    // recorded (e.g. a duplicate webhook retry upstream) — skip re-emission.
    if (insertError) {
      if (insertError.code === '23505') return; // unique_violation
      console.error('emitAutomationEvent: failed to record event', insertError);
      return;
    }

    await deliverEvent(event.id, eventType, payload, event.attempts + 1);
  } catch (error) {
    console.error('emitAutomationEvent: unexpected error', error);
  }
}

/**
 * Performs (or re-performs, for the retry sweeper) a single delivery attempt
 * for an already-recorded event, logging the outcome either way.
 */
export async function deliverEvent(
  eventId: string,
  eventType: string,
  payload: unknown,
  attemptNumber: number
): Promise<void> {
  const supabase = createAdminClient();
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !secret) {
    console.warn(
      `deliverEvent: N8N_WEBHOOK_URL/N8N_WEBHOOK_SECRET not configured — skipping delivery of "${eventType}"`
    );
    await supabase
      .from('automation_events')
      .update({ status: 'failed', last_error: 'N8N_WEBHOOK_URL or N8N_WEBHOOK_SECRET not configured' })
      .eq('id', eventId);
    return;
  }

  const body = JSON.stringify({
    eventId,
    eventType,
    emittedAt: new Date().toISOString(),
    data: payload,
  });
  const signature = signPayload(body, secret);
  const timestamp = Date.now().toString();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-FixLocal-Event': eventType,
    'X-FixLocal-Event-Id': eventId,
    'X-FixLocal-Timestamp': timestamp,
    'X-FixLocal-Signature': signature,
  };

  const startedAt = Date.now();
  let succeeded = false;
  let responseStatus: number | null = null;
  let responseBody = '';
  let errorMessage: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    responseStatus = response.status;
    responseBody = (await response.text()).slice(0, 2000);
    succeeded = response.ok;
    if (!succeeded) errorMessage = `Non-2xx response: ${response.status}`;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown delivery error';
  }

  const durationMs = Date.now() - startedAt;

  await supabase.from('automation_webhook_deliveries').insert({
    event_id: eventId,
    attempt_number: attemptNumber,
    target_url: webhookUrl,
    request_headers: headers as unknown as Json,
    response_status: responseStatus,
    response_body: responseBody || null,
    duration_ms: durationMs,
    succeeded,
    error_message: errorMessage,
  });

  if (succeeded) {
    await supabase
      .from('automation_events')
      .update({ status: 'delivered', attempts: attemptNumber, last_error: null, next_retry_at: null })
      .eq('id', eventId);
    return;
  }

  const exhausted = attemptNumber >= MAX_ATTEMPTS;
  const nextRetryAt = exhausted
    ? null
    : new Date(Date.now() + computeNextRetryDelaySeconds(attemptNumber) * 1000).toISOString();

  await supabase
    .from('automation_events')
    .update({
      status: exhausted ? 'exhausted' : 'failed',
      attempts: attemptNumber,
      last_error: errorMessage,
      next_retry_at: nextRetryAt,
    })
    .eq('id', eventId);
}
