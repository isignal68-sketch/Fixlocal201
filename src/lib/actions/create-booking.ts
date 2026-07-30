'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/client';
import { siteConfig } from '@/lib/site-config';
import { sendBookingRequestEmail, sendNewBookingRequestEmail } from '@/lib/email/send-transactional-email';
import { emitAutomationEvent } from '@/lib/automation/emit-event';
import { getBookingAutomationContext } from '@/lib/automation/booking-context';

const createBookingSchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  scheduledAt: z.string(),
  durationMinutes: z.number().int().min(15),
  addressLine1: z.string().trim().min(3),
  addressLine2: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(1),
  state: z.string().trim().length(2),
  zipCode: z.string().trim().min(5).max(10),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  priceCents: z.number().int().min(0),
  paymentMethodId: z.string().optional(),
});

export interface CreateBookingResult {
  success: boolean;
  message?: string;
  bookingId?: string;
}

export async function createBookingAction(
  input: z.infer<typeof createBookingSchema>
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Please check the booking details.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in to book.' };

  const platformFeeCents = Math.round(
    parsed.data.priceCents * (siteConfig.commissionPercent / 100)
  );

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_id: user.id,
      provider_id: parsed.data.providerId,
      service_id: parsed.data.serviceId,
      status: 'pending',
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: parsed.data.durationMinutes,
      address_line1: parsed.data.addressLine1,
      address_line2: parsed.data.addressLine2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      zip_code: parsed.data.zipCode,
      notes: parsed.data.notes || null,
      price_cents: parsed.data.priceCents,
      platform_fee_cents: platformFeeCents,
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    return { success: false, message: bookingError?.message ?? 'Could not create booking.' };
  }

  // Authorize payment now (manual capture), released or captured once the
  // job is completed or cancelled. Requires the customer to have a saved
  // payment method; if pricing is fully custom-quote (price 0) skip payment.
  if (parsed.data.priceCents > 0 && parsed.data.paymentMethodId) {
    try {
      const stripe = getStripeClient();

      const { data: pm } = await supabase
        .from('payment_methods')
        .select('stripe_payment_method_id')
        .eq('id', parsed.data.paymentMethodId)
        .eq('user_id', user.id)
        .single();

      if (pm) {
        const stripePm = await stripe.paymentMethods.retrieve(pm.stripe_payment_method_id);
        const customerId = typeof stripePm.customer === 'string' ? stripePm.customer : undefined;

        if (customerId) {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: parsed.data.priceCents,
            currency: 'usd',
            customer: customerId,
            payment_method: pm.stripe_payment_method_id,
            capture_method: 'manual',
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
            metadata: { bookingId: booking.id },
          });

          await supabase.from('transactions').insert({
            booking_id: booking.id,
            stripe_payment_intent_id: paymentIntent.id,
            amount_cents: parsed.data.priceCents,
            platform_fee_cents: platformFeeCents,
            provider_payout_cents: parsed.data.priceCents - platformFeeCents,
            status: 'pending',
          });
        }
      }
    } catch (stripeError) {
      // Payment authorization failed — remove the booking so the customer
      // isn't left with an unpaid pending request.
      await supabase.from('bookings').delete().eq('id', booking.id);
      const message = stripeError instanceof Error ? stripeError.message : 'Payment failed.';
      return { success: false, message };
    }
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('user_id, business_name')
    .eq('id', parsed.data.providerId)
    .single();

  const { data: service } = await supabase
    .from('services')
    .select('title')
    .eq('id', parsed.data.serviceId)
    .single();

  const scheduledAtLabel = new Date(parsed.data.scheduledAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  if (provider) {
    await supabase.from('notifications').insert({
      user_id: provider.user_id,
      type: 'booking_request',
      title: 'New booking request',
      body: 'You have a new booking request waiting for your response.',
      link: `/pro/dashboard/bookings/${booking.id}`,
    });

    const { data: providerUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', provider.user_id)
      .single();

    if (providerUser?.email) {
      await sendNewBookingRequestEmail({
        to: providerUser.email,
        customerName: user.user_metadata?.full_name ?? user.email ?? 'A customer',
        serviceTitle: service?.title ?? 'a service',
        scheduledAtLabel,
        bookingId: booking.id,
      });
    }
  }

  if (user.email) {
    await sendBookingRequestEmail({
      to: user.email,
      providerName: provider?.business_name ?? 'the provider',
      serviceTitle: service?.title ?? 'your service',
      scheduledAtLabel,
      bookingId: booking.id,
    });
  }

  const context = await getBookingAutomationContext(booking.id);
  if (context) {
    await emitAutomationEvent('booking.created', context, {
      idempotencyKey: `booking.created:${booking.id}`,
    });
  }

  redirect(`/dashboard/bookings/${booking.id}?new=1`);
}
