'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X, Star } from 'lucide-react';
import { updateProviderVerificationAction, toggleProviderFeaturedAction } from '@/lib/actions/admin-providers';
import { Button } from '@/components/ui/button';
import type { ProviderRow } from '@/types/database';

export function AdminProviderActions({ provider }: { provider: ProviderRow }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleVerify(status: 'verified' | 'rejected') {
    setIsPending(true);
    const result = await updateProviderVerificationAction(provider.id, status);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not update provider.');
      return;
    }
    toast.success(status === 'verified' ? 'Provider verified' : 'Provider rejected');
    router.refresh();
  }

  async function handleToggleFeatured() {
    setIsPending(true);
    await toggleProviderFeaturedAction(provider.id, !provider.is_featured);
    setIsPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {provider.verification_status !== 'verified' && (
        <Button size="sm" onClick={() => handleVerify('verified')} disabled={isPending}>
          <Check className="size-3.5" />
          Verify
        </Button>
      )}
      {provider.verification_status !== 'rejected' && (
        <Button size="sm" variant="outline" onClick={() => handleVerify('rejected')} disabled={isPending}>
          <X className="size-3.5" />
          Reject
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggleFeatured}
        disabled={isPending}
        aria-pressed={provider.is_featured}
      >
        <Star className={provider.is_featured ? 'size-3.5 fill-amber-400 text-amber-400' : 'size-3.5'} />
      </Button>
    </div>
  );
}
