'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateConversation } from '@/lib/data/messaging';
import { sendPushToUser } from '@/lib/push/send-push';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

const sendMessageSchema = z
  .object({
    conversationId: z.string().uuid().optional(),
    providerId: z.string().uuid().optional(),
    body: z.string().trim().max(4000).optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((data) => !!data.body || !!data.imageUrl, {
    message: 'Message cannot be empty.',
  });

export interface SendMessageResult {
  success: boolean;
  message?: string;
  conversationId?: string;
}

export async function sendMessageAction(
  input: z.infer<typeof sendMessageSchema>
): Promise<SendMessageResult> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Message cannot be empty.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  let conversationId = parsed.data.conversationId;

  if (!conversationId && parsed.data.providerId) {
    conversationId = (await getOrCreateConversation(user.id, parsed.data.providerId)) ?? undefined;
  }

  if (!conversationId) {
    return { success: false, message: 'Could not find or start a conversation.' };
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: parsed.data.body || null,
    image_url: parsed.data.imageUrl || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select('customer_id, provider_id, providers(user_id)')
    .eq('id', conversationId)
    .single();

  if (conversation) {
    const providerUserId = (conversation as unknown as { providers: { user_id: string } | null })
      ?.providers?.user_id;
    const recipientId = user.id === conversation.customer_id ? providerUserId : conversation.customer_id;

    if (recipientId) {
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'new_message',
        title: 'New message',
        body: parsed.data.body ? parsed.data.body.slice(0, 120) : 'Sent a photo',
        link: `/dashboard/messages/${conversationId}`,
      });
      await sendPushToUser(recipientId, {
        title: 'New message on FixLocal',
        body: parsed.data.body ? parsed.data.body.slice(0, 120) : 'Sent a photo',
        url: `/dashboard/messages/${conversationId}`,
      });

      const { data: recipientUser } = await supabase.from('users').select('email').eq('id', recipientId).single();
      const { data: newMessage } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (newMessage) {
        await emitAutomationEvent('message.sent', {
          messageId: newMessage.id,
          conversationId,
          senderId: user.id,
          recipientId,
          recipientEmail: recipientUser?.email ?? '',
          bodyPreview: parsed.data.body?.slice(0, 200) ?? '',
          hasImage: !!parsed.data.imageUrl,
        });
      }
    }
  }

  revalidatePath('/dashboard/messages');
  revalidatePath('/pro/dashboard/messages');

  return { success: true, conversationId };
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .is('read_at', null)
    .neq('sender_id', user.id);
}
