'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { addPhotoAction, deletePhotoAction } from '@/lib/actions/photos';
import { ImageUploader } from '@/components/shared/image-uploader';
import type { PhotoRow } from '@/types/database';

export function PhotoGalleryManager({
  providerId,
  photos,
}: {
  providerId: string;
  photos: PhotoRow[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleUploaded(url: string) {
    const result = await addPhotoAction(url);
    if (!result.success) {
      toast.error(result.message ?? 'Could not save photo.');
      return;
    }
    router.refresh();
  }

  async function handleDelete(photoId: string) {
    setPendingId(photoId);
    const result = await deletePhotoAction(photoId);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.message ?? 'Could not delete photo.');
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <ImageUploader
        bucket="provider-gallery"
        pathPrefix={providerId}
        onUploaded={handleUploaded}
        label="Upload a photo of your work"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
            <Image src={photo.url} alt={photo.caption ?? 'Work photo'} fill className="object-cover" />
            <button
              onClick={() => handleDelete(photo.id)}
              disabled={pendingId === photo.id}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Delete photo"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
