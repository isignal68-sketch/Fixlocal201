import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getCustomerConversations, getOrCreateConversation } from '@/lib/data/messaging';
import { ConversationList } from '@/components/shared/conversation-list';
import { EmptyState } from '@/components/shared/empty-state';

export const metadata: Metadata = { title: 'Messages' };

interface MessagesPageProps {
  searchParams: Promise<{ provider?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { provider } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  if (provider) {
    const conversationId = await getOrCreateConversation(user.id, provider);
    if (conversationId) redirect(`/dashboard/messages/${conversationId}`);
  }

  const conversations = await getCustomerConversations(user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Messages</h1>
      <div className="mt-6 max-w-xl">
        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            description="Message a provider from their profile to start a conversation."
            actionLabel="Find a pro"
            actionHref="/search"
          />
        ) : (
          <ConversationList
            conversations={conversations}
            basePath="/dashboard/messages"
            perspective="customer"
          />
        )}
      </div>
    </div>
  );
}
