'use client';

import * as React from 'react';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethodRow } from '@/types/database';

export function PaymentMethodSelector({
  methods,
  selectedId,
  onSelect,
}: {
  methods: PaymentMethodRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (methods.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        No saved payment method.{' '}
        <Link href="/dashboard/settings/payment-methods" className="text-primary hover:underline">
          Add a card
        </Link>{' '}
        before booking.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {methods.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm',
            selectedId === m.id ? 'border-primary bg-primary-50' : 'border-border hover:bg-secondary'
          )}
        >
          <CreditCard className="size-4 text-muted-foreground" />
          <span className="capitalize">
            {m.brand} •••• {m.last4}
          </span>
        </button>
      ))}
    </div>
  );
}
