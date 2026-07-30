'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Bell, BellOff } from 'lucide-react';
import {
  savePushSubscriptionAction,
  removePushSubscriptionAction,
} from '@/lib/actions/push-subscriptions';
import { Button } from '@/components/ui/button';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      navigator.serviceWorker.register('/sw.js').then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      });
    }
  }, []);

  async function handleSubscribe() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      toast.error('Push notifications are not configured yet.');
      return;
    }

    setIsPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const result = await savePushSubscriptionAction({
        endpoint: json.endpoint,
        keys: json.keys,
      });

      if (!result.success) {
        toast.error(result.message ?? 'Could not enable notifications.');
        setIsPending(false);
        return;
      }

      setIsSubscribed(true);
      toast.success('Push notifications enabled');
    } catch {
      toast.error('Permission denied or unavailable.');
    }
    setIsPending(false);
  }

  async function handleUnsubscribe() {
    setIsPending(true);
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await removePushSubscriptionAction(subscription.endpoint);
      await subscription.unsubscribe();
    }

    setIsSubscribed(false);
    setIsPending(false);
    toast.success('Push notifications disabled');
  }

  if (!isSupported) return null;

  return (
    <Button variant="outline" onClick={isSubscribed ? handleUnsubscribe : handleSubscribe} isLoading={isPending}>
      {isSubscribed ? <BellOff className="size-4" /> : <Bell className="size-4" />}
      {isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
    </Button>
  );
}
