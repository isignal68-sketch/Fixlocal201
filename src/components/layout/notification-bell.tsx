'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Popover from '@radix-ui/react-popover';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { NotificationRow } from '@/types/database';

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = React.useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (active && data) {
        setNotifications(data as NotificationRow[]);
        setUnreadCount(data.filter((n) => !n.read_at).length);
      }
    }

    load();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationRow, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function markAllRead() {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  }

  return (
    <Popover.Root onOpenChange={(open) => open && unreadCount > 0 && markAllRead()}>
      <Popover.Trigger asChild>
        <button
          className="relative flex size-9 items-center justify-center rounded-lg hover:bg-secondary"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-accent" />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-50 w-80 rounded-xl border border-border bg-popover text-popover-foreground shadow-elevated"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="font-medium">Notifications</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? '#'}
                  className={cn(
                    'block border-b border-border/60 px-4 py-3 text-sm last:border-0 hover:bg-secondary',
                    !n.read_at && 'bg-primary-50/50'
                  )}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
