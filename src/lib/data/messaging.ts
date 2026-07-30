import { createClient } from '@/lib/supabase/server';
import type { ConversationRow, MessageRow, ProviderRow, UserRow } from '@/types/database';

export interface ConversationWithParticipants extends ConversationRow {
  provider: Pick<ProviderRow, 'id' | 'business_name' | 'slug' | 'logo_url'> | null;
  customer: Pick<UserRow, 'id' | 'full_name' | 'avatar_url'> | null;
  last_message?: Pick<MessageRow, 'body' | 'created_at' | 'sender_id'> | null;
  unread_count?: number;
}

export async function getCustomerConversations(
  customerId: string
): Promise<ConversationWithParticipants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*, provider:providers(id, business_name, slug, logo_url)')
    .eq('customer_id', customerId)
    .order('last_message_at', { ascending: false });

  if (error) return [];
  return (data as unknown as ConversationWithParticipants[]) ?? [];
}

export async function getProviderConversations(
  providerId: string
): Promise<ConversationWithParticipants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*, customer:users!conversations_customer_id_fkey(id, full_name, avatar_url)')
    .eq('provider_id', providerId)
    .order('last_message_at', { ascending: false });

  if (error) return [];
  return (data as unknown as ConversationWithParticipants[]) ?? [];
}

export async function getOrCreateConversation(
  customerId: string,
  providerId: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('customer_id', customerId)
    .eq('provider_id', providerId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ customer_id: customerId, provider_id: providerId })
    .select('id')
    .single();

  if (error) return null;
  return created.id;
}

export async function getConversationMessages(conversationId: string): Promise<MessageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data as MessageRow[]) ?? [];
}

export async function getConversationById(
  conversationId: string
): Promise<ConversationWithParticipants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select(
      '*, provider:providers(id, business_name, slug, logo_url), customer:users!conversations_customer_id_fkey(id, full_name, avatar_url)'
    )
    .eq('id', conversationId)
    .single();

  if (error) return null;
  return data as unknown as ConversationWithParticipants;
}
