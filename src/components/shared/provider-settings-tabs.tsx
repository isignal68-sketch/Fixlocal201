'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Business profile', href: '/pro/dashboard/settings' },
  { label: 'Availability', href: '/pro/dashboard/settings/availability' },
  { label: 'Verification', href: '/pro/dashboard/settings/verification' },
  { label: 'Payouts', href: '/pro/dashboard/settings/payouts' },
  { label: 'Security', href: '/pro/dashboard/settings/security' },
];

export function ProviderSettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
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
