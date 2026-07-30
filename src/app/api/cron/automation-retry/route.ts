import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { deliverEvent } from '@/lib/automation/emit-event';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Re-attempts delivery for any automation event whose last delivery failed
 * and whose backoff window has elapsed. Intended to be invoked on a
 * schedule (see vercel.json `crons`) roughly every 5 minutes.
 *
 * Protected by CRON_SECRET so it can't be triggered by arbitrary requests.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: dueEvents, error } = await supabase
    .from('automation_events')
    .select('id, event_type, payload, attempts')
    .eq('status', 'failed')
    .lte('next_retry_at', new Date().toISOString())
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let retried = 0;
  for (const event of dueEvents ?? []) {
    await deliverEvent(event.id, event.event_type, event.payload, event.attempts + 1);
    retried += 1;
  }

  return NextResponse.json({ retried });
}
