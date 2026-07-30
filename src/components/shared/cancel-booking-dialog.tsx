'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cancelBookingAction } from '@/lib/actions/bookings';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CancelBookingDialog({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleCancel() {
    setIsSubmitting(true);
    const result = await cancelBookingAction(bookingId, reason);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not cancel booking.');
      return;
    }

    toast.success('Booking cancelled.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Cancel booking</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            The provider will be notified immediately. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="Let the provider know why (optional)"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep booking
          </Button>
          <Button variant="destructive" onClick={handleCancel} isLoading={isSubmitting}>
            Cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
