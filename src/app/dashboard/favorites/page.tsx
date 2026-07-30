import type { Metadata } from 'next';
import { Heart } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getCustomerFavorites } from '@/lib/data/customer-dashboard';
import { ProviderCard } from '@/components/shared/provider-card';
import { EmptyState } from '@/components/shared/empty-state';

export const metadata: Metadata = { title: 'Favorites' };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const favorites = await getCustomerFavorites(user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Favorites</h1>

      <div className="mt-6">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Save providers you like to find them quickly later."
            actionLabel="Browse providers"
            actionHref="/search"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <ProviderCard key={fav.id} provider={fav.provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
