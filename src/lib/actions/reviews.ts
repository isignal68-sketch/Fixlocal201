'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { sendPushToUser } from '@/lib/push/send-push';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  providerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
  photoUrls: z.array(z.string().url()).max(6).optional(),
});

export interface ReviewActionResult {
  success: boolean;
  message?: string;
}

export async function submitReviewAction(input: z.infer<typeof reviewSchema>): Promise<ReviewActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Please provide a valid rating.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { error } = await supabase.from('reviews').insert({
    booking_id: parsed.data.bookingId,
    customer_id: user.id,
    provider_id: parsed.data.providerId,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
    photo_urls: parsed.data.photoUrls ?? [],
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('user_id')
    .eq('id', parsed.data.providerId)
    .single();

  if (provider) {
    await supabase.from('notifications').insert({
      user_id: provider.user_id,
      type: 'new_review',
      title: 'You got a new review',
      body: `A customer left a ${parsed.data.rating}-star review.`,
      link: `/pro/dashboard/reviews`,
    });
    await sendPushToUser(provider.user_id, {
      title: 'New review',
      body: `You received a ${parsed.data.rating}-star review.`,
      url: '/pro/dashboard/reviews',
    });
  }

  const { data: reviewRow } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', parsed.data.bookingId)
    .single();

  const { data: customerRow } = await supabase.from('users').select('full_name').eq('id', user.id).single();

  if (reviewRow && provider) {
    await emitAutomationEvent(
      'review.created',
      {
        reviewId: reviewRow.id,
        bookingId: parsed.data.bookingId,
        providerId: parsed.data.providerId,
        providerUserId: provider.user_id,
        customerName: customerRow?.full_name ?? 'A customer',
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
      { idempotencyKey: `review.created:${reviewRow.id}` }
    );
  }

  revalidatePath(`/dashboard/bookings/${parsed.data.bookingId}`);
  revalidatePath('/dashboard/reviews');

  return { success: true };
}

export async function replyToReviewAction(
  reviewId: string,
  reply: string
): Promise<ReviewActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: review, error } = await supabase
    .from('reviews')
    .update({ provider_reply: reply, provider_replied_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select('provider_id, customer_id')
    .single();

  if (error || !review) return { success: false, message: error?.message ?? 'Could not post reply.' };

  await emitAutomationEvent(
    'review.replied',
    { reviewId, providerId: review.provider_id, customerId: review.customer_id, reply },
    { idempotencyKey: `review.replied:${reviewId}` }
  );

  revalidatePath('/pro/dashboard/reviews');
  return { success: true };
}
