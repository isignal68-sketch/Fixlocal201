'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';

const TIER_PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  growth: process.env.STRIPE_PRICE_GROWTH,
  pro: process.env.STRIPE_PRICE_PRO,
};

export interface SubscriptionActionResult {
  success: boolean;
  message?: string;
}

export async function startSubscriptionCheckoutAction(
  tier: 'starter' | 'growth' | 'pro'
): Promise<SubscriptionActionResult> {
  const priceId = TIER_PRICE_IDS[tier];
  if (!priceId) {
    return {
      success: false,
      message: 'This plan is not yet configured. Contact support to upgrade.',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { success: false, message: 'You must be signed in.' };

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!provider) return { success: false, message: 'No provider profile found.' };

  const stripe = getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/pro/dashboard/subscription?success=1`,
    cancel_url: `${siteUrl}/pro/dashboard/subscription?canceled=1`,
    metadata: { providerId: provider.id, tier },
  });

  if (!session.url) {
    return { success: false, message: 'Could not start checkout.' };
  }

  redirect(session.url);
}

export async function cancelSubscriptionAction(): Promise<SubscriptionActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!provider) return { success: false, message: 'No provider profile found.' };

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('provider_id', provider.id)
    .single();

  if (!subscription?.stripe_subscription_id) {
    return { success: false, message: 'No active subscription found.' };
  }

  const stripe = getStripeClient();
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  return { success: true };
}
