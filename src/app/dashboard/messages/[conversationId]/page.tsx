import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import {
  getCustomerConversations,
  getConversationById,
  getConversationMessages,
} from '@/lib/data/messaging';
import { ConversationList } from '@/components/shared/conversation-list';
import { MessageThread } from '@/components/shared/message-thread';

export const metadata: Metadata = { title: 'Messages' };

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const [conversation, conversations, messages] = await Promise.all([
    getConversationById(conversationId),
    getCustomerConversations(user.id),
    getConversationMessages(conversationId),
  ]);

  if (!conversation || conversation.customer_id !== user.id) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <ConversationList
          conversations={conversations}
          activeConversationId={conversationId}
          basePath="/dashboard/messages"
          perspective="customer"
        />
      </div>
      <MessageThread
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={messages}
        otherPartyName={conversation.provider?.business_name ?? 'Provider'}
      />
    </div>
  );
}
