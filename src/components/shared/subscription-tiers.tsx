'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { startSubscriptionCheckoutAction, cancelSubscriptionAction } from '@/lib/actions/subscription';
import { Button } from '@/components/ui/button';

interface Tier {
  id: 'free' | 'starter' | 'growth' | 'pro';
  name: string;
  price: string;
  features: string[];
}

const tiers: Tier[] = [
  { id: 'free', name: 'Free', price: '$0/mo', features: ['Basic profile listing', 'Standard search placement', 'Up to 3 active services'] },
  { id: 'starter', name: 'Starter', price: '$49/mo', features: ['Everything in Free', 'Unlimited services', 'Priority search placement'] },
  { id: 'growth', name: 'Growth', price: '$99/mo', features: ['Everything in Starter', 'Featured badge', 'Advanced analytics'] },
  { id: 'pro', name: 'Pro', price: '$149/mo', features: ['Everything in Growth', 'Top search placement', 'Dedicated support'] },
];

export function SubscriptionTiers({ currentTier }: { currentTier: string }) {
  const [pendingTier, setPendingTier] = React.useState<string | null>(null);

  async function handleSelect(tier: Tier) {
    if (tier.id === 'free') {
      const result = await cancelSubscriptionAction();
      if (!result.success) {
        toast.error(result.message ?? 'Could not update plan.');
      } else {
        toast.success('Your plan will move to Free at the end of the billing period.');
      }
      return;
    }

    setPendingTier(tier.id);
    const result = await startSubscriptionCheckoutAction(tier.id as 'starter' | 'growth' | 'pro');
    setPendingTier(null);

    if (result && !result.success) {
      toast.error(result.message ?? 'Could not start checkout.');
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiers.map((tier) => {
        const isCurrent = tier.id === currentTier;
        return (
          <div
            key={tier.id}
            className={cn(
              'flex flex-col rounded-2xl border p-6',
              isCurrent ? 'border-2 border-primary' : 'border-border'
            )}
          >
            <p className="font-display font-semibold">{tier.name}</p>
            <p className="mt-1 font-display text-2xl font-bold">{tier.price}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={isCurrent ? 'outline' : 'default'}
              className="mt-6"
              disabled={isCurrent}
              isLoading={pendingTier === tier.id}
              onClick={() => handleSelect(tier)}
            >
              {isCurrent ? 'Current plan' : tier.id === 'free' ? 'Downgrade' : 'Upgrade'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
