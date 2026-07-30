'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function SettingsTabs({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  const tabs = [
    { label: 'Profile', href: `${basePath}/settings` },
    { label: 'Security', href: `${basePath}/settings/security` },
    { label: 'Payment methods', href: `${basePath}/settings/payment-methods` },
    { label: 'Notifications', href: `${basePath}/settings/notification-preferences` },
  ];

  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'border-b-2 px-4 py-2.5 text-sm font-medium',
            pathname === tab.href
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
