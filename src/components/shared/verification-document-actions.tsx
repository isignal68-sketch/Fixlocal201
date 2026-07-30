'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { updateVerificationDocumentStatusAction } from '@/lib/actions/admin-providers';
import { Button } from '@/components/ui/button';

export function VerificationDocumentActions({ verificationId }: { verificationId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handle(status: 'verified' | 'rejected') {
    setIsPending(true);
    const result = await updateVerificationDocumentStatusAction(verificationId, status);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not update document.');
      return;
    }
    toast.success(status === 'verified' ? 'Document approved' : 'Document rejected');
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handle('verified')} disabled={isPending}>
        <Check className="size-3.5" />
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => handle('rejected')} disabled={isPending}>
        <X className="size-3.5" />
        Reject
      </Button>
    </div>
  );
}
