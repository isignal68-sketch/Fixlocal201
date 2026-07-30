import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import {
  getProviderConversations,
  getConversationById,
  getConversationMessages,
} from '@/lib/data/messaging';
import { ConversationList } from '@/components/shared/conversation-list';
import { MessageThread } from '@/components/shared/message-thread';

export const metadata: Metadata = { title: 'Messages' };

interface ProviderConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ProviderConversationPage({ params }: ProviderConversationPageProps) {
  const { conversationId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const [conversation, conversations, messages] = await Promise.all([
    getConversationById(conversationId),
    getProviderConversations(provider.id),
    getConversationMessages(conversationId),
  ]);

  if (!conversation || conversation.provider_id !== provider.id) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <ConversationList
          conversations={conversations}
          activeConversationId={conversationId}
          basePath="/pro/dashboard/messages"
          perspective="provider"
        />
      </div>
      <MessageThread
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={messages}
        otherPartyName={conversation.customer?.full_name ?? 'Customer'}
      />
    </div>
  );
}
