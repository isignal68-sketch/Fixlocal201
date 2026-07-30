import type { Metadata } from 'next';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { StripeConnectButton } from '@/components/shared/stripe-connect-button';

export const metadata: Metadata = { title: 'Payouts' };

interface PayoutsPageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function ProviderPayoutsPage({ searchParams }: PayoutsPageProps) {
  await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const isReady = provider.stripe_charges_enabled && provider.stripe_payouts_enabled;

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-lg font-semibold">Payout account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Connect a Stripe account to receive payouts after each completed booking.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border p-5">
        {isReady ? (
          <>
            <CheckCircle2 className="size-6 text-accent" />
            <div>
              <p className="font-medium">Payouts are active</p>
              <p className="text-sm text-muted-foreground">
                Funds are automatically deposited after each completed job.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="size-6 text-amber-500" />
            <div>
              <p className="font-medium">Payouts not yet set up</p>
              <p className="text-sm text-muted-foreground">
                Finish Stripe onboarding to start getting paid for completed jobs.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <StripeConnectButton hasAccount={!!provider.stripe_account_id} />
      </div>
    </div>
  );
}
