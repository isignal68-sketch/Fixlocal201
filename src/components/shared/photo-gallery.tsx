import Image from 'next/image';
import type { PhotoRow } from '@/types/database';

export function PhotoGallery({ photos }: { photos: PhotoRow[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.slice(0, 9).map((photo) => (
        <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
          <Image
            src={photo.url}
            alt={photo.caption ?? 'Provider work photo'}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 33vw, 50vw"
          />
        </div>
      ))}
    </div>
  );
}
