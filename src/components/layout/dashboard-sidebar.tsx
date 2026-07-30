'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  MessageCircle,
  Heart,
  Star,
  Bell,
  Receipt,
  LifeBuoy,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const customerNav: DashboardNavItem[] = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { title: 'Messages', href: '/dashboard/messages', icon: MessageCircle },
  { title: 'Favorites', href: '/dashboard/favorites', icon: Heart },
  { title: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { title: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { title: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar({ items = customerNav }: { items?: DashboardNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive =
          item.href === items[0]?.href ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
            )}
          >
            <item.icon className="size-[18px]" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
