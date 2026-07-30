'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X, Play, CheckCheck } from 'lucide-react';
import {
  acceptBookingAction,
  declineBookingAction,
  startBookingAction,
  markBookingCompleteAction,
} from '@/lib/actions/bookings';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { BookingStatus } from '@/types/database';

export function ProviderBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [declineOpen, setDeclineOpen] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState('');

  async function runAction(fn: () => Promise<{ success: boolean; message?: string }>) {
    setIsPending(true);
    const result = await fn();
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Something went wrong.');
      return;
    }

    router.refresh();
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-3">
        <Button onClick={() => runAction(() => acceptBookingAction(bookingId))} isLoading={isPending}>
          <Check className="size-4" />
          Accept
        </Button>
        <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <X className="size-4" />
              Decline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline this booking?</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Let the customer know why (optional)"
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeclineOpen(false)}>
                Nevermind
              </Button>
              <Button
                variant="destructive"
                isLoading={isPending}
                onClick={() =>
                  runAction(() => declineBookingAction(bookingId, declineReason)).then(() =>
                    setDeclineOpen(false)
                  )
                }
              >
                Decline booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <Button onClick={() => runAction(() => startBookingAction(bookingId))} isLoading={isPending}>
        <Play className="size-4" />
        Start job
      </Button>
    );
  }

  if (status === 'in_progress') {
    return (
      <Button onClick={() => runAction(() => markBookingCompleteAction(bookingId))} isLoading={isPending}>
        <CheckCheck className="size-4" />
        Mark complete
      </Button>
    );
  }

  return null;
}
