import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { BusinessProfileForm } from '@/components/shared/business-profile-form';

export const metadata: Metadata = { title: 'Business profile' };

export default async function ProviderBusinessProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  return <BusinessProfileForm provider={provider} />;
}
