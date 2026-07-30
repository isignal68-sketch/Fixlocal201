import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { SubscriptionTiers } from '@/components/shared/subscription-tiers';

export const metadata: Metadata = { title: 'Subscription' };

interface SubscriptionPageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function ProviderSubscriptionPage({ searchParams }: SubscriptionPageProps) {
  const { success } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Subscription</h1>
      <p className="mt-1 text-muted-foreground">
        Choose the plan that fits how you want to grow on FixLocal.
      </p>

      {success === '1' && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-accent/10 p-4 text-sm text-accent-700">
          <CheckCircle2 className="size-4" />
          Your subscription is updating — this can take a minute to reflect.
        </div>
      )}

      <div className="mt-8">
        <SubscriptionTiers currentTier={provider.subscription_tier} />
      </div>
    </div>
  );
}
