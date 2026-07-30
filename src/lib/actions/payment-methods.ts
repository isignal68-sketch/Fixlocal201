'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';

export interface PaymentMethodActionResult {
  success: boolean;
  message?: string;
  clientSecret?: string;
}

async function getOrCreateStripeCustomerId(userId: string, email: string): Promise<string> {
  const supabase = await createClient();
  const stripe = getStripeClient();

  const { data: existing } = await supabase
    .from('payment_methods')
    .select('stripe_payment_method_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const pm = await stripe.paymentMethods.retrieve(existing.stripe_payment_method_id);
    if (typeof pm.customer === 'string') return pm.customer;
  }

  const customer = await stripe.customers.create({ email, metadata: { userId } });
  return customer.id;
}

export async function createSetupIntentAction(): Promise<PaymentMethodActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { success: false, message: 'You must be signed in.' };

  const stripe = getStripeClient();
  const customerId = await getOrCreateStripeCustomerId(user.id, user.email);

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });

  return { success: true, clientSecret: setupIntent.client_secret ?? undefined };
}

export async function removePaymentMethodAction(
  paymentMethodId: string
): Promise<PaymentMethodActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: pm } = await supabase
    .from('payment_methods')
    .select('id, stripe_payment_method_id, user_id')
    .eq('id', paymentMethodId)
    .single();

  if (!pm || pm.user_id !== user.id) {
    return { success: false, message: 'Payment method not found.' };
  }

  const stripe = getStripeClient();
  await stripe.paymentMethods.detach(pm.stripe_payment_method_id);
  await supabase.from('payment_methods').delete().eq('id', paymentMethodId);

  revalidatePath('/dashboard/settings/payment-methods');
  return { success: true };
}

export async function setDefaultPaymentMethodAction(
  paymentMethodId: string
): Promise<PaymentMethodActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', user.id);
  await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', paymentMethodId)
    .eq('user_id', user.id);

  revalidatePath('/dashboard/settings/payment-methods');
  return { success: true };
}
