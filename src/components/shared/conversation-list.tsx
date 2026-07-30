import Link from 'next/link';
import Image from 'next/image';
import { cn, formatRelativeTime, initials } from '@/lib/utils';
import type { ConversationWithParticipants } from '@/lib/data/messaging';

export function ConversationList({
  conversations,
  activeConversationId,
  basePath,
  perspective,
}: {
  conversations: ConversationWithParticipants[];
  activeConversationId?: string;
  basePath: string;
  perspective: 'customer' | 'provider';
}) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const name =
          perspective === 'customer'
            ? conv.provider?.business_name ?? 'Provider'
            : conv.customer?.full_name ?? 'Customer';
        const avatar =
          perspective === 'customer' ? conv.provider?.logo_url : conv.customer?.avatar_url;

        return (
          <Link
            key={conv.id}
            href={`${basePath}/${conv.id}`}
            className={cn(
              'flex items-center gap-3 rounded-xl p-3 transition-colors',
              activeConversationId === conv.id ? 'bg-primary-50' : 'hover:bg-secondary'
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold">
              {avatar ? (
                <Image src={avatar} alt={name} width={40} height={40} className="size-full object-cover" />
              ) : (
                initials(name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {conv.last_message?.body ?? 'Start the conversation'}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(conv.last_message_at)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
