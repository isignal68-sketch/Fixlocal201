'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { replyToReviewAction } from '@/lib/actions/reviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ReviewReplyForm({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [reply, setReply] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  async function handleSubmit() {
    if (!reply.trim()) return;
    setIsSubmitting(true);
    const result = await replyToReviewAction(reviewId, reply.trim());
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not post reply.');
      return;
    }

    toast.success('Reply posted');
    router.refresh();
  }

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        Reply
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        placeholder="Write a public reply..."
        rows={3}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
          Post reply
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
