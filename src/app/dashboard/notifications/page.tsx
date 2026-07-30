import type { Metadata } from 'next';
import { Bell } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/shared/empty-state';
import { cn, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import type { NotificationRow } from '@/types/database';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const notifications = (data as NotificationRow[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Notifications</h1>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nothing here yet"
            description="Booking updates, messages, and account alerts will show up here."
          />
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? '#'}
                className={cn('block p-4 hover:bg-secondary/50', !n.read_at && 'bg-primary-50/40')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
