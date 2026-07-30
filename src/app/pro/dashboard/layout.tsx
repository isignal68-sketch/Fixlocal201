import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar, type DashboardNavItem } from '@/components/layout/dashboard-sidebar';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  BarChart3,
  Users,
  Star,
  MessageCircle,
  Wrench,
  Image as ImageIcon,
  CreditCard,
  Receipt,
  Settings,
} from 'lucide-react';

const providerNav: DashboardNavItem[] = [
  { title: 'Overview', href: '/pro/dashboard', icon: LayoutDashboard },
  { title: 'Bookings', href: '/pro/dashboard/bookings', icon: Calendar },
  { title: 'Calendar', href: '/pro/dashboard/calendar', icon: CalendarClock },
  { title: 'Analytics', href: '/pro/dashboard/analytics', icon: BarChart3 },
  { title: 'Customers', href: '/pro/dashboard/customers', icon: Users },
  { title: 'Reviews', href: '/pro/dashboard/reviews', icon: Star },
  { title: 'Messages', href: '/pro/dashboard/messages', icon: MessageCircle },
  { title: 'Services', href: '/pro/dashboard/services', icon: Wrench },
  { title: 'Photos', href: '/pro/dashboard/photos', icon: ImageIcon },
  { title: 'Invoices', href: '/pro/dashboard/invoices', icon: Receipt },
  { title: 'Subscription', href: '/pro/dashboard/subscription', icon: CreditCard },
  { title: 'Settings', href: '/pro/dashboard/settings', icon: Settings },
];

export default async function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/pro/dashboard');
  if (user.role === 'admin') redirect('/admin');

  const provider = await getProviderForUser(user.id);
  if (!provider) redirect('/pro/onboarding');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <DashboardSidebar items={providerNav} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
