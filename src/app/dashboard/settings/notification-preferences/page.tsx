import type { Metadata } from 'next';
import { NotificationPreferences } from '@/components/shared/notification-preferences';
import { PushNotificationToggle } from '@/components/shared/push-notification-toggle';

export const metadata: Metadata = { title: 'Notification preferences' };

export default function NotificationPreferencesPage() {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Push notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Get notified on this device for new messages and booking updates.
      </p>
      <div className="mt-4">
        <PushNotificationToggle />
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold">Email notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose what you want to be emailed about.
      </p>
      <div className="mt-6">
        <NotificationPreferences />
      </div>
    </div>
  );
}
