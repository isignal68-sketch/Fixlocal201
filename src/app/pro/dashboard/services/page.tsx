import type { Metadata } from 'next';
import { Wrench } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { getAllProviderServices } from '@/lib/data/provider-detail';
import { getActiveCategories } from '@/lib/data/providers';
import { ServiceFormDialog } from '@/components/shared/service-form-dialog';
import { ServiceManagementRow } from '@/components/shared/service-management-row';
import { EmptyState } from '@/components/shared/empty-state';

export const metadata: Metadata = { title: 'Manage services' };

export default async function ProviderServicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const [services, categories] = await Promise.all([
    getAllProviderServices(provider.id),
    getActiveCategories(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Services</h1>
          <p className="mt-1 text-muted-foreground">Manage what customers can book from you.</p>
        </div>
        <ServiceFormDialog categories={categories} />
      </div>

      <div className="mt-6 space-y-3">
        {services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services yet"
            description="Add at least one service so customers can book you."
          />
        ) : (
          services.map((service) => (
            <ServiceManagementRow key={service.id} service={service} categories={categories} />
          ))
        )}
      </div>
    </div>
  );
}
