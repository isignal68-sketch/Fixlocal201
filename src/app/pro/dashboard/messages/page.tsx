import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { getProviderConversations, getOrCreateConversation } from '@/lib/data/messaging';
import { ConversationList } from '@/components/shared/conversation-list';
import { EmptyState } from '@/components/shared/empty-state';

export const metadata: Metadata = { title: 'Messages' };

interface ProviderMessagesPageProps {
  searchParams: Promise<{ customer?: string }>;
}

export default async function ProviderMessagesPage({ searchParams }: ProviderMessagesPageProps) {
  const { customer } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  if (customer) {
    const conversationId = await getOrCreateConversation(customer, provider.id);
    if (conversationId) redirect(`/pro/dashboard/messages/${conversationId}`);
  }

  const conversations = await getProviderConversations(provider.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Messages</h1>
      <div className="mt-6 max-w-xl">
        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            description="Conversations with customers will show up here."
          />
        ) : (
          <ConversationList
            conversations={conversations}
            basePath="/pro/dashboard/messages"
            perspective="provider"
          />
        )}
      </div>
    </div>
  );
}
