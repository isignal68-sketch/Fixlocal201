import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ProfileForm } from '@/components/shared/profile-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Profile settings' };

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <ProfileForm user={user} />

      {user.role !== 'provider' && user.role !== 'admin' && (
        <div className="rounded-2xl border p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-accent/10 p-3">
              <Briefcase className="size-5 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">Become a provider</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                List your business on FixLocal and start getting booked by customers near you.
              </p>
              <Button asChild className="mt-4">
                <Link href="/pro/onboarding">Set up your provider profile</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
