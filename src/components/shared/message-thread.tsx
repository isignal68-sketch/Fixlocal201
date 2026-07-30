'use client';

import * as React from 'react';
import Image from 'next/image';
import { Send, ImagePlus, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sendMessageAction, markConversationReadAction } from '@/lib/actions/messages';
import { cn, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { MessageRow } from '@/types/database';

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherPartyName,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: MessageRow[];
  otherPartyName: string;
}) {
  const [messages, setMessages] = React.useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = React.useState('');
  const [pendingImageUrl, setPendingImageUrl] = React.useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    markConversationReadAction(conversationId);
  }, [conversationId]);

  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as MessageRow;
          setMessages((prev) => (prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]));
          if (newMessage.sender_id !== currentUserId) {
            markConversationReadAction(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB.');
      return;
    }

    setIsUploadingImage(true);
    const supabase = createClient();
    const extension = file.name.split('.').pop();
    const path = `${conversationId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from('message-images').upload(path, file);
    if (error) {
      toast.error(error.message || 'Upload failed');
      setIsUploadingImage(false);
      return;
    }

    const { data } = supabase.storage.from('message-images').getPublicUrl(path);
    setPendingImageUrl(data.publicUrl);
    setIsUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSend() {
    const body = draft.trim();
    if ((!body && !pendingImageUrl) || isSending) return;

    setIsSending(true);
    setDraft('');
    const imageUrl = pendingImageUrl;
    setPendingImageUrl(null);

    const optimisticMessage: MessageRow = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: body || null,
      image_url: imageUrl,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    const result = await sendMessageAction({
      conversationId,
      body: body || undefined,
      imageUrl: imageUrl || undefined,
    });
    setIsSending(false);

    if (!result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setDraft(body);
      setPendingImageUrl(imageUrl);
    }
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col rounded-2xl border border-border">
      <div className="border-b border-border px-5 py-3">
        <p className="font-medium">{otherPartyName}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-xs rounded-2xl px-4 py-2.5 text-sm sm:max-w-sm',
                  isMine
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm bg-secondary text-secondary-foreground'
                )}
              >
                {msg.image_url && (
                  <div className="relative mb-1.5 h-40 w-48 overflow-hidden rounded-lg">
                    <Image src={msg.image_url} alt="Attachment" fill className="object-cover" />
                  </div>
                )}
                {msg.body && <p className="whitespace-pre-wrap break-words">{msg.body}</p>}
                <p
                  className={cn(
                    'mt-1 text-[10px] opacity-70',
                    isMine ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        {pendingImageUrl && (
          <div className="relative mb-2 h-16 w-16">
            <Image src={pendingImageUrl} alt="Attachment preview" fill className="rounded-lg object-cover" />
            <button
              onClick={() => setPendingImageUrl(null)}
              className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-black/70 text-white"
            >
              <X className="size-2.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-input text-muted-foreground hover:bg-secondary"
            aria-label="Attach image"
          >
            {isUploadingImage ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="max-h-32 min-h-10 resize-none"
          />
          <Button size="icon" onClick={handleSend} disabled={(!draft.trim() && !pendingImageUrl) || isSending}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
