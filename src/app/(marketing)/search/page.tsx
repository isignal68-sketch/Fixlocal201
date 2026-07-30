import type { Metadata } from 'next';
import { searchProviders } from '@/lib/data/providers';
import { SearchFilters } from '@/components/shared/search-filters';
import { ProviderCard } from '@/components/shared/provider-card';
import { Pagination } from '@/components/shared/pagination';
import { HeroSearchBar } from '@/components/shared/hero-search-bar';
import { SearchViewToggle } from '@/components/shared/search-view-toggle';
import { ProviderSearchMap } from '@/components/shared/provider-search-map';

export const metadata: Metadata = {
  title: 'Search local service providers',
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    zip?: string;
    lat?: string;
    lng?: string;
    category?: string;
    minRating?: string;
    sort?: string;
    page?: string;
    view?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? '1') || 1;
  const view = params.view === 'map' ? 'map' : 'list';

  const { providers, total, perPage, distanceByProviderId } = await searchProviders({
    query: params.q,
    zipCode: params.zip,
    lat: params.lat ? Number(params.lat) : undefined,
    lng: params.lng ? Number(params.lng) : undefined,
    categorySlug: params.category,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    sort: (params.sort as 'rating' | 'reviews' | 'newest') ?? 'rating',
    page,
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function buildHref(targetPage: number) {
    const p = new URLSearchParams();
    if (params.q) p.set('q', params.q);
    if (params.zip) p.set('zip', params.zip);
    if (params.category) p.set('category', params.category);
    if (params.minRating) p.set('minRating', params.minRating);
    if (params.sort) p.set('sort', params.sort);
    if (params.view) p.set('view', params.view);
    p.set('page', String(targetPage));
    return `/search?${p.toString()}`;
  }

  const firstProvider = providers[0];
  const mapCenter =
    params.lat && params.lng
      ? { lat: Number(params.lat), lng: Number(params.lng) }
      : firstProvider?.base_latitude && firstProvider?.base_longitude
        ? { lat: firstProvider.base_latitude, lng: firstProvider.base_longitude }
        : { lat: 39.8283, lng: -98.5795 }; // continental US center fallback

  const providersWithDistance = providers.map((p) => ({
    ...p,
    distance_miles: distanceByProviderId?.[p.id],
  }));

  return (
    <div className="container py-10">
      <div className="mb-8 flex justify-center">
        <HeroSearchBar />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <SearchFilters />

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} provider{total === 1 ? '' : 's'} found
              {params.q ? ` for "${params.q}"` : ''}
            </p>
            <SearchViewToggle />
          </div>

          {providers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-24 text-center">
              <p className="font-medium">No providers matched your search.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a broader search term, a larger radius, or fewer filters.
              </p>
            </div>
          ) : view === 'map' ? (
            <div className="h-[600px] overflow-hidden rounded-2xl border border-border">
              <ProviderSearchMap providers={providersWithDistance} center={mapCenter} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {providersWithDistance.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
              <div className="mt-10">
                <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
