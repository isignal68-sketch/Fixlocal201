'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { submitReviewAction } from '@/lib/actions/reviews';
import { StarRatingInput } from '@/components/shared/star-rating-input';
import { ImageUploader } from '@/components/shared/image-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function LeaveReviewDialog({
  bookingId,
  providerId,
  providerName,
  open,
  onOpenChange,
}: {
  bookingId: string;
  providerId: string;
  providerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [photoUrls, setPhotoUrls] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast.error('Select a star rating first.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitReviewAction({ bookingId, providerId, rating, comment, photoUrls });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not submit review.');
      return;
    }

    toast.success('Review submitted — thank you!');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate your experience with {providerName}</DialogTitle>
          <DialogDescription>Your review helps other homeowners choose with confidence.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <StarRatingInput value={rating} onChange={setRating} />
          <Textarea
            placeholder="How did the job go? (optional)"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {photoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photoUrls.map((url) => (
                <div key={url} className="relative size-16 overflow-hidden rounded-lg">
                  <Image src={url} alt="Review photo" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrls((prev) => prev.filter((u) => u !== url))}
                    className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photoUrls.length < 6 && (
            <ImageUploader
              bucket="review-photos"
              pathPrefix="reviews"
              label="Add a photo"
              className="p-3 text-xs"
              onUploaded={(url) => setPhotoUrls((prev) => [...prev, url])}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
