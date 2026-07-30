import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect('/login?redirect=/dashboard');
  if (user.role === 'admin') redirect('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <DashboardSidebar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
