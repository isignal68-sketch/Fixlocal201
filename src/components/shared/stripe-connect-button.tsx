'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { startStripeConnectOnboardingAction } from '@/lib/actions/stripe-connect';
import { Button } from '@/components/ui/button';

export function StripeConnectButton({ hasAccount }: { hasAccount: boolean }) {
  const [isPending, setIsPending] = React.useState(false);

  async function handleClick() {
    setIsPending(true);
    const result = await startStripeConnectOnboardingAction();
    setIsPending(false);

    if (result && !result.success) {
      toast.error(result.message ?? 'Could not start Stripe onboarding.');
    }
  }

  return (
    <Button onClick={handleClick} isLoading={isPending}>
      {hasAccount ? 'Continue Stripe setup' : 'Connect with Stripe'}
    </Button>
  );
}
