'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { removePaymentMethodAction, setDefaultPaymentMethodAction } from '@/lib/actions/payment-methods';
import { Button } from '@/components/ui/button';
import type { PaymentMethodRow } from '@/types/database';

export function PaymentMethodsList({ methods }: { methods: PaymentMethodRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleRemove(id: string) {
    setPendingId(id);
    const result = await removePaymentMethodAction(id);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.message ?? 'Could not remove card.');
      return;
    }

    toast.success('Card removed');
    router.refresh();
  }

  async function handleSetDefault(id: string) {
    setPendingId(id);
    await setDefaultPaymentMethodAction(id);
    setPendingId(null);
    router.refresh();
  }

  if (methods.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <CreditCard className="size-5" />
        No payment methods saved yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium capitalize">
                {m.brand} •••• {m.last4}
              </p>
              <p className="text-xs text-muted-foreground">
                Expires {String(m.exp_month).padStart(2, '0')}/{m.exp_year}
              </p>
            </div>
            {m.is_default && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                Default
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!m.is_default && (
              <Button
                variant="ghost"
                size="sm"
                disabled={pendingId === m.id}
                onClick={() => handleSetDefault(m.id)}
              >
                <Star className="size-3.5" />
                Set default
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={pendingId === m.id}
              onClick={() => handleRemove(m.id)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
