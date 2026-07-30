import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { getProviderAvailability } from '@/lib/data/provider-detail';
import { AvailabilityForm } from '@/components/shared/availability-form';

export const metadata: Metadata = { title: 'Availability' };

export default async function ProviderAvailabilityPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const availability = await getProviderAvailability(provider.id);

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Weekly availability</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Set the hours customers can book you. You can still adjust individual bookings later.
      </p>
      <div className="mt-6">
        <AvailabilityForm existing={availability} />
      </div>
    </div>
  );
}
