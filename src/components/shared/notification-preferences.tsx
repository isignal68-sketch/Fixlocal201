'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface PreferenceItem {
  key: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

const emailPrefs: PreferenceItem[] = [
  { key: 'email_booking_updates', label: 'Booking updates', description: 'Confirmations, reminders, and status changes.', defaultChecked: true },
  { key: 'email_messages', label: 'New messages', description: 'When a provider or customer sends you a message.', defaultChecked: true },
  { key: 'email_promotions', label: 'Offers & promotions', description: 'Occasional discounts and product updates.', defaultChecked: false },
];

export function NotificationPreferences() {
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>(
    Object.fromEntries(emailPrefs.map((p) => [p.key, p.defaultChecked]))
  );

  function handleToggle(key: string, checked: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: checked }));
    toast.success('Preference saved');
  }

  return (
    <div className="max-w-lg space-y-1">
      {emailPrefs.map((pref) => (
        <div key={pref.key} className="flex items-center justify-between border-b border-border py-4">
          <div>
            <p className="text-sm font-medium">{pref.label}</p>
            <p className="text-sm text-muted-foreground">{pref.description}</p>
          </div>
          <Switch checked={prefs[pref.key]} onCheckedChange={(c) => handleToggle(pref.key, c)} />
        </div>
      ))}
    </div>
  );
}
