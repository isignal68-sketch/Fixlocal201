'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';

export interface ConnectActionResult {
  success: boolean;
  message?: string;
}

export async function startStripeConnectOnboardingAction(): Promise<ConnectActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { success: false, message: 'You must be signed in.' };

  const { data: provider } = await supabase
    .from('providers')
    .select('id, stripe_account_id, business_name')
    .eq('user_id', user.id)
    .single();

  if (!provider) return { success: false, message: 'No provider profile found.' };

  const stripe = getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  let accountId = provider.stripe_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      business_type: 'individual',
      business_profile: { name: provider.business_name },
    });
    accountId = account.id;

    await supabase.from('providers').update({ stripe_account_id: accountId }).eq('id', provider.id);
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl}/pro/dashboard/settings/payouts`,
    return_url: `${siteUrl}/pro/dashboard/settings/payouts?success=1`,
    type: 'account_onboarding',
  });

  redirect(accountLink.url);
}
