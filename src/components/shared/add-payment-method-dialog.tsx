'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { getStripeBrowserClient } from '@/lib/stripe/browser-client';
import { createSetupIntentAction } from '@/lib/actions/payment-methods';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

function CardForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);

    const setupResult = await createSetupIntentAction();
    if (!setupResult.success || !setupResult.clientSecret) {
      toast.error(setupResult.message ?? 'Could not start card setup.');
      setIsSubmitting(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmCardSetup(setupResult.clientSecret, {
      payment_method: { card: cardElement },
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message ?? 'Could not save card.');
      return;
    }

    toast.success('Card saved');
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-input px-3.5 py-3">
        <CardElement
          options={{
            style: { base: { fontSize: '14px', fontFamily: 'var(--font-sans)' } },
          }}
        />
      </div>
      <Button type="submit" disabled={!stripe} isLoading={isSubmitting} className="w-full">
        Save card
      </Button>
    </form>
  );
}

export function AddPaymentMethodDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const stripePromise = React.useMemo(() => getStripeBrowserClient(), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Add card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a payment method</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <CardForm
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
