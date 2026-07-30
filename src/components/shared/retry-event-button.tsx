'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RotateCw } from 'lucide-react';
import { retryAutomationEventAction } from '@/lib/actions/admin-automation';
import { Button } from '@/components/ui/button';

export function RetryEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleRetry() {
    setIsPending(true);
    const result = await retryAutomationEventAction(eventId);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Retry failed.');
      return;
    }
    toast.success('Retry attempted');
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={handleRetry} disabled={isPending}>
      <RotateCw className="size-3.5" />
      Retry now
    </Button>
  );
}
