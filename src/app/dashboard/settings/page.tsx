import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ProfileForm } from '@/components/shared/profile-form';

export const metadata: Metadata = { title: 'Profile settings' };

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return <ProfileForm user={user} />;
}
