'use server';

import { createClient } from '@/lib/supabase/server';

export interface PushSubscriptionActionResult {
  success: boolean;
  message?: string;
}

interface SubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function savePushSubscriptionAction(
  subscription: SubscriptionInput
): Promise<PushSubscriptionActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'endpoint' }
  );

  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function removePushSubscriptionAction(
  endpoint: string
): Promise<PushSubscriptionActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);

  if (error) return { success: false, message: error.message };
  return { success: true };
}
