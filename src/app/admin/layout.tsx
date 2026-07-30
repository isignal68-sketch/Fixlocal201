import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar, type DashboardNavItem } from '@/components/layout/dashboard-sidebar';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  CreditCard,
  Flag,
  LifeBuoy,
  Grid3x3,
  MapPin,
  Ticket,
  FileClock,
  Zap,
} from 'lucide-react';

const adminNav: DashboardNavItem[] = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Providers', href: '/admin/providers', icon: Briefcase },
  { title: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { title: 'Automations', href: '/admin/automations', icon: Zap },
  { title: 'Reports', href: '/admin/reports', icon: Flag },
  { title: 'Support', href: '/admin/support', icon: LifeBuoy },
  { title: 'Categories', href: '/admin/categories', icon: Grid3x3 },
  { title: 'Cities', href: '/admin/cities', icon: MapPin },
  { title: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { title: 'Logs', href: '/admin/logs', icon: FileClock },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin');
  if (user.role !== 'admin') redirect('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <DashboardSidebar items={adminNav} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
