'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaveReviewDialog } from '@/components/shared/leave-review-dialog';

export function BookingReviewAction({
  bookingId,
  providerId,
  providerName,
}: {
  bookingId: string;
  providerId: string;
  providerName: string;
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(searchParams.get('review') === '1');

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Star className="size-4" />
        Leave a review
      </Button>
      <LeaveReviewDialog
        bookingId={bookingId}
        providerId={providerId}
        providerName={providerName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
