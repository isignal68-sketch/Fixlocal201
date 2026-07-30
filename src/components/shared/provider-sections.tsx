import Link from 'next/link';
import { ProviderCard } from '@/components/shared/provider-card';
import type { ProviderRow } from '@/types/database';

export function FeaturedProvidersSection({ providers }: { providers: ProviderRow[] }) {
  if (providers.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-20">
      <div className="container">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">Featured providers</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked pros doing great work right now.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TopRatedProvidersSection({ providers }: { providers: ProviderRow[] }) {
  if (providers.length === 0) return null;

  return (
    <section className="container py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold">Top rated this month</h2>
          <p className="mt-2 text-muted-foreground">Loved by customers across the country.</p>
        </div>
        <Link href="/search?sort=rating" className="hidden text-sm font-medium text-primary hover:underline sm:block">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </section>
  );
}
