'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendPushToUser } from '@/lib/push/send-push';
import { getStripeClient } from '@/lib/stripe/client';
import { createAndStoreInvoice } from '@/lib/invoices/generate-invoice';
import { sendBookingStatusEmail, sendReceiptEmail } from '@/lib/email/send-transactional-email';
import { formatCurrency } from '@/lib/utils';
import { emitAutomationEvent } from '@/lib/automation/emit-event';
import { getBookingAutomationContext } from '@/lib/automation/booking-context';

export interface ActionResult {
  success: boolean;
  message?: string;
}

/**
 * Releases the held payment for a booking that will not be completed.
 * If the payment was only authorized (not yet captured), cancels the
 * authorization. If it was already captured, issues a full refund.
 */
async function releaseBookingPaymentHold(bookingId: string): Promise<void> {
  const supabase = await createClient();

  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, stripe_payment_intent_id, status, amount_cents')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (!transaction?.stripe_payment_intent_id) return;

  try {
    const stripe = getStripeClient();

    if (transaction.status === 'succeeded') {
      await stripe.refunds.create({ payment_intent: transaction.stripe_payment_intent_id });
      await supabase.from('transactions').update({ status: 'refunded' }).eq('id', transaction.id);

      const { data: booking } = await supabase
        .from('bookings')
        .select('customer_id, provider_id')
        .eq('id', bookingId)
        .single();

      if (booking) {
        await emitAutomationEvent(
          'payment.refunded',
          {
            bookingId,
            paymentIntentId: transaction.stripe_payment_intent_id,
            amountCents: transaction.amount_cents,
            customerId: booking.customer_id,
            providerId: booking.provider_id,
          },
          { idempotencyKey: `payment.refunded:${bookingId}` }
        );
      }
    } else {
      await stripe.paymentIntents.cancel(transaction.stripe_payment_intent_id);
      await supabase.from('transactions').update({ status: 'failed' }).eq('id', transaction.id);
    }
  } catch (error) {
    console.error('releaseBookingPaymentHold error', error);
  }
}

export async function acceptBookingAction(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'accepted' })
    .eq('id', bookingId)
    .select('customer_id, service_id, provider_id, users:customer_id(email), providers(business_name), services(title)')
    .single();

  if (error || !booking) return { success: false, message: error?.message ?? 'Could not accept booking.' };

  const bookingDetails = booking as unknown as {
    customer_id: string;
    users: { email: string } | null;
    providers: { business_name: string } | null;
    services: { title: string } | null;
  };

  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    type: 'booking_accepted',
    title: 'Your booking was accepted',
    body: 'The provider confirmed your booking request.',
    link: `/dashboard/bookings/${bookingId}`,
  });
  await sendPushToUser(booking.customer_id, {
    title: 'Booking accepted',
    body: 'The provider confirmed your booking request.',
    url: `/dashboard/bookings/${bookingId}`,
  });
  if (bookingDetails.users?.email) {
    await sendBookingStatusEmail({
      to: bookingDetails.users.email,
      status: 'accepted',
      providerName: bookingDetails.providers?.business_name ?? 'your provider',
      serviceTitle: bookingDetails.services?.title ?? 'your service',
      bookingId,
    });
  }

  const context = await getBookingAutomationContext(bookingId);
  if (context) {
    await emitAutomationEvent('booking.accepted', context, { idempotencyKey: `booking.accepted:${bookingId}` });
  }

  revalidatePath('/pro/dashboard/bookings');
  revalidatePath(`/pro/dashboard/bookings/${bookingId}`);
  return { success: true };
}

export async function declineBookingAction(bookingId: string, reason: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'declined', cancellation_reason: reason, cancelled_by: user.id })
    .eq('id', bookingId)
    .select('customer_id, users:customer_id(email), providers(business_name), services(title)')
    .single();

  if (error || !booking) return { success: false, message: error?.message ?? 'Could not decline booking.' };

  await releaseBookingPaymentHold(bookingId);

  const bookingDetails = booking as unknown as {
    customer_id: string;
    users: { email: string } | null;
    providers: { business_name: string } | null;
    services: { title: string } | null;
  };

  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    type: 'booking_declined',
    title: 'Your booking was declined',
    body: reason || 'The provider is unable to take this booking.',
    link: `/dashboard/bookings/${bookingId}`,
  });
  if (bookingDetails.users?.email) {
    await sendBookingStatusEmail({
      to: bookingDetails.users.email,
      status: 'declined',
      providerName: bookingDetails.providers?.business_name ?? 'the provider',
      serviceTitle: bookingDetails.services?.title ?? 'the service',
      bookingId,
    });
  }

  const context = await getBookingAutomationContext(bookingId);
  if (context) {
    await emitAutomationEvent(
      'booking.declined',
      { ...context, reason },
      { idempotencyKey: `booking.declined:${bookingId}` }
    );
  }

  revalidatePath('/pro/dashboard/bookings');
  revalidatePath(`/pro/dashboard/bookings/${bookingId}`);
  return { success: true };
}

export async function markBookingCompleteAction(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', bookingId)
    .select(
      'customer_id, provider_id, price_cents, platform_fee_cents, users:customer_id(email), providers(business_name), services(title)'
    )
    .single();

  if (error || !booking) return { success: false, message: error?.message ?? 'Could not mark complete.' };

  const bookingDetails = booking as unknown as {
    customer_id: string;
    provider_id: string;
    price_cents: number;
    platform_fee_cents: number;
    users: { email: string } | null;
    providers: { business_name: string } | null;
    services: { title: string } | null;
  };

  let invoiceSignedUrl: string | undefined;

  // Capture the previously-authorized payment and transfer the provider's
  // share to their connected Stripe account.
  try {
    const { data: transaction } = await supabase
      .from('transactions')
      .select('id, stripe_payment_intent_id, status')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (transaction?.stripe_payment_intent_id && transaction.status === 'pending') {
      const stripe = getStripeClient();
      const captured = await stripe.paymentIntents.capture(transaction.stripe_payment_intent_id);

      await supabase
        .from('transactions')
        .update({ status: captured.status === 'succeeded' ? 'succeeded' : 'pending' })
        .eq('id', transaction.id);

      const { data: provider } = await supabase
        .from('providers')
        .select('stripe_account_id, stripe_payouts_enabled')
        .eq('id', booking.provider_id)
        .single();

      if (provider?.stripe_account_id && provider.stripe_payouts_enabled) {
        const payoutCents = booking.price_cents - booking.platform_fee_cents;
        await stripe.transfers.create({
          amount: payoutCents,
          currency: 'usd',
          destination: provider.stripe_account_id,
          transfer_group: `booking_${bookingId}`,
          metadata: { bookingId },
        });
      }
    }

    const invoiceId = await createAndStoreInvoice(bookingId);
    if (invoiceId) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('pdf_url, invoice_number, total_cents')
        .eq('id', invoiceId)
        .single();

      if (invoice?.pdf_url) {
        const { data: signed } = await supabase.storage
          .from('invoices')
          .createSignedUrl(invoice.pdf_url, 60 * 60 * 24 * 7);
        invoiceSignedUrl = signed?.signedUrl;
      }

      if (bookingDetails.users?.email && invoice) {
        await sendReceiptEmail({
          to: bookingDetails.users.email,
          invoiceNumber: invoice.invoice_number,
          totalFormatted: formatCurrency(invoice.total_cents),
          serviceTitle: bookingDetails.services?.title ?? 'your service',
          invoiceUrl: invoiceSignedUrl,
        });
      }
    }
  } catch (paymentError) {
    console.error('Booking completion payment capture failed', paymentError);
    // The booking stays marked completed — payment issues are surfaced to
    // admins via the transaction status for manual follow-up rather than
    // blocking the provider from closing out the job.
  }

  await supabase.from('notifications').insert({
    user_id: booking.customer_id,
    type: 'booking_completed',
    title: 'Job marked complete',
    body: 'Your provider marked this booking as complete. Leave a review to help others!',
    link: `/dashboard/bookings/${bookingId}?review=1`,
  });
  await sendPushToUser(booking.customer_id, {
    title: 'Job complete',
    body: 'Your provider marked this booking as complete. Leave a review!',
    url: `/dashboard/bookings/${bookingId}?review=1`,
  });
  if (bookingDetails.users?.email) {
    await sendBookingStatusEmail({
      to: bookingDetails.users.email,
      status: 'completed',
      providerName: bookingDetails.providers?.business_name ?? 'your provider',
      serviceTitle: bookingDetails.services?.title ?? 'your service',
      bookingId,
    });
  }

  const context = await getBookingAutomationContext(bookingId);
  if (context) {
    await emitAutomationEvent('booking.completed', context, { idempotencyKey: `booking.completed:${bookingId}` });
  }

  revalidatePath('/pro/dashboard/bookings');
  revalidatePath(`/pro/dashboard/bookings/${bookingId}`);
  revalidatePath('/dashboard/invoices');
  return { success: true };
}

export async function startBookingAction(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('bookings').update({ status: 'in_progress' }).eq('id', bookingId);

  if (error) return { success: false, message: error.message };

  revalidatePath('/pro/dashboard/bookings');
  revalidatePath(`/pro/dashboard/bookings/${bookingId}`);
  return { success: true };
}

export async function cancelBookingAction(
  bookingId: string,
  reason: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_by: user.id,
    })
    .eq('id', bookingId);

  if (error) {
    return { success: false, message: error.message };
  }

  await releaseBookingPaymentHold(bookingId);

  const { data: booking } = await supabase
    .from('bookings')
    .select('provider_id, service_id, providers(user_id, business_name), services(title), users:customer_id(full_name)')
    .eq('id', bookingId)
    .single();

  const bookingDetails = booking as unknown as {
    providers: { user_id: string; business_name: string } | null;
    services: { title: string } | null;
    users: { full_name: string } | null;
  } | null;

  const providerUserId = bookingDetails?.providers?.user_id;

  if (providerUserId) {
    await supabase.from('notifications').insert({
      user_id: providerUserId,
      type: 'booking_cancelled',
      title: 'Booking cancelled',
      body: 'A customer cancelled an upcoming booking.',
      link: `/pro/dashboard/bookings/${bookingId}`,
    });

    const { data: providerUser } = await supabase.from('users').select('email').eq('id', providerUserId).single();
    if (providerUser?.email) {
      await sendBookingStatusEmail({
        to: providerUser.email,
        status: 'cancelled',
        providerName: bookingDetails?.providers?.business_name ?? 'you',
        serviceTitle: bookingDetails?.services?.title ?? 'the service',
        bookingId,
      });
    }
  }

  revalidatePath('/dashboard/bookings');
  revalidatePath(`/dashboard/bookings/${bookingId}`);

  const context = await getBookingAutomationContext(bookingId);
  if (context) {
    await emitAutomationEvent(
      'booking.cancelled',
      { ...context, reason, cancelledBy: 'customer' },
      { idempotencyKey: `booking.cancelled:${bookingId}` }
    );
  }

  return { success: true };
}
