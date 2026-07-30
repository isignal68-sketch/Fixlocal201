'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Flag } from 'lucide-react';
import { submitReportAction } from '@/lib/actions/reports';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

const REASONS = [
  'Inappropriate content',
  'Suspected fraud or scam',
  'Unsafe or unlicensed work',
  'Harassment',
  'Fake review',
  'Other',
];

export function ReportDialog({
  providerId,
  reviewId,
  triggerLabel = 'Report',
}: {
  providerId?: string;
  reviewId?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit() {
    if (!reason) {
      toast.error('Select a reason.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitReportAction({
      reportedProviderId: providerId,
      reportedReviewId: reviewId,
      reason,
      details,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not submit report.');
      return;
    }

    toast.success('Report submitted. Our team will review it shortly.');
    setOpen(false);
    setReason('');
    setDetails('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
          <Flag className="size-3" />
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a concern</DialogTitle>
          <DialogDescription>
            Our trust & safety team reviews every report. This won&apos;t notify anyone directly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Add any additional details (optional)"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} isLoading={isSubmitting}>
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
