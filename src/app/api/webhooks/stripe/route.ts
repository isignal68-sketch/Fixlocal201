import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // -----------------------------------------------------------------
      // Card saved via SetupIntent (add payment method flow)
      // -----------------------------------------------------------------
      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        const paymentMethodId = setupIntent.payment_method;
        const customerId = setupIntent.customer;

        if (typeof paymentMethodId === 'string' && typeof customerId === 'string') {
          const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
          const customer = await stripe.customers.retrieve(customerId);

          if (!customer.deleted && pm.card) {
            const userId = (customer as Stripe.Customer).metadata?.userId;
            if (userId) {
              const { count } = await supabase
                .from('payment_methods')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId);

              await supabase.from('payment_methods').upsert(
                {
                  user_id: userId,
                  stripe_payment_method_id: pm.id,
                  brand: pm.card.brand,
                  last4: pm.card.last4,
                  exp_month: pm.card.exp_month,
                  exp_year: pm.card.exp_year,
                  is_default: (count ?? 0) === 0,
                },
                { onConflict: 'stripe_payment_method_id' }
              );
            }
          }
        }
        break;
      }

      // -----------------------------------------------------------------
      // Booking payment authorized/captured/failed
      // -----------------------------------------------------------------
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;
        if (bookingId) {
          await supabase
            .from('transactions')
            .update({ status: 'succeeded' })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          const { data: booking } = await supabase
            .from('bookings')
            .select('customer_id, provider_id')
            .eq('id', bookingId)
            .single();

          if (booking) {
            await emitAutomationEvent(
              'payment.succeeded',
              {
                bookingId,
                paymentIntentId: paymentIntent.id,
                amountCents: paymentIntent.amount,
                customerId: booking.customer_id,
                providerId: booking.provider_id,
              },
              { idempotencyKey: `payment.succeeded:${paymentIntent.id}` }
            );
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        const bookingId = paymentIntent.metadata?.bookingId;
        if (bookingId) {
          const { data: booking } = await supabase
            .from('bookings')
            .select('customer_id, provider_id')
            .eq('id', bookingId)
            .single();

          if (booking) {
            await supabase.from('notifications').insert({
              user_id: booking.customer_id,
              type: 'payment_failed',
              title: 'Payment failed',
              body: 'We could not authorize payment for your booking. Please update your payment method.',
              link: `/dashboard/bookings/${bookingId}`,
            });

            await emitAutomationEvent(
              'payment.failed',
              {
                bookingId,
                paymentIntentId: paymentIntent.id,
                amountCents: paymentIntent.amount,
                customerId: booking.customer_id,
                providerId: booking.provider_id,
              },
              { idempotencyKey: `payment.failed:${paymentIntent.id}` }
            );
          }
        }
        break;
      }

      // -----------------------------------------------------------------
      // Stripe Connect account status changes (payouts/charges enabled)
      // -----------------------------------------------------------------
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await supabase
          .from('providers')
          .update({
            stripe_charges_enabled: account.charges_enabled ?? false,
            stripe_payouts_enabled: account.payouts_enabled ?? false,
          })
          .eq('stripe_account_id', account.id);
        break;
      }

      // -----------------------------------------------------------------
      // Provider subscription checkout completed
      // -----------------------------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription && session.metadata?.providerId) {
          const subscriptionId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const tier = (session.metadata.tier as 'starter' | 'growth' | 'pro') ?? 'starter';

          await supabase.from('subscriptions').upsert(
            {
              provider_id: session.metadata.providerId,
              tier,
              status: subscription.status as 'active' | 'past_due' | 'canceled' | 'trialing',
              stripe_subscription_id: subscription.id,
              stripe_customer_id:
                typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            },
            { onConflict: 'provider_id' }
          );

          await supabase
            .from('providers')
            .update({ subscription_tier: tier })
            .eq('id', session.metadata.providerId);

          const { data: providerRow } = await supabase
            .from('providers')
            .select('business_name, users:user_id(email)')
            .eq('id', session.metadata.providerId)
            .single();

          await emitAutomationEvent(
            'subscription.created',
            {
              providerId: session.metadata.providerId,
              providerEmail: (providerRow as unknown as { users: { email: string } | null })?.users?.email ?? '',
              businessName: providerRow?.business_name ?? '',
              tier,
              stripeSubscriptionId: subscription.id,
            },
            { idempotencyKey: `subscription.created:${subscription.id}` }
          );
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('provider_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (existing) {
          const isCanceled = event.type === 'customer.subscription.deleted' || subscription.status === 'canceled';

          await supabase
            .from('subscriptions')
            .update({
              status: isCanceled ? 'canceled' : (subscription.status as 'active' | 'past_due' | 'trialing'),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          if (isCanceled) {
            await supabase
              .from('providers')
              .update({ subscription_tier: 'free' })
              .eq('id', existing.provider_id);
          }

          const { data: providerRow } = await supabase
            .from('providers')
            .select('business_name, subscription_tier, users:user_id(email)')
            .eq('id', existing.provider_id)
            .single();

          await emitAutomationEvent(
            isCanceled ? 'subscription.canceled' : 'subscription.updated',
            {
              providerId: existing.provider_id,
              providerEmail: (providerRow as unknown as { users: { email: string } | null })?.users?.email ?? '',
              businessName: providerRow?.business_name ?? '',
              tier: (providerRow?.subscription_tier as 'free' | 'starter' | 'growth' | 'pro') ?? 'free',
              stripeSubscriptionId: subscription.id,
            },
            { idempotencyKey: `subscription.${isCanceled ? 'canceled' : 'updated'}:${subscription.id}:${event.id}` }
          );
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error('Stripe webhook handler error', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
