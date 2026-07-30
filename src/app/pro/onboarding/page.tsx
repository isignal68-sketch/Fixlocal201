import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { ProviderOnboardingForm } from '@/components/shared/provider-onboarding-form';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';

export const metadata: Metadata = { title: 'Set up your provider profile' };

export default async function ProviderOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/pro/onboarding');

  const existing = await getProviderForUser(user.id);
  if (existing) redirect('/pro/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container max-w-2xl py-16">
        <h1 className="font-display text-3xl font-bold">Set up your provider profile</h1>
        <p className="mt-2 text-muted-foreground">
          Just a few details to get your business live on FixLocal.
        </p>
        <div className="mt-10">
          <ProviderOnboardingForm />
        </div>
      </div>
    </div>
  );
}
