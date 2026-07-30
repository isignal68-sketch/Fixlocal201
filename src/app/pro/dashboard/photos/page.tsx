import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { getProviderPhotos } from '@/lib/data/provider-detail';
import { PhotoGalleryManager } from '@/components/shared/photo-gallery-manager';

export const metadata: Metadata = { title: 'Photos' };

export default async function ProviderPhotosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const photos = await getProviderPhotos(provider.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Photos</h1>
      <p className="mt-1 text-muted-foreground">
        Showcase your best work. Great photos help you win more bookings.
      </p>
      <div className="mt-6">
        <PhotoGalleryManager providerId={provider.id} photos={photos} />
      </div>
    </div>
  );
}
