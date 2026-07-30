import Link from 'next/link';
import Image from 'next/image';
import { Star, BadgeCheck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProviderRow } from '@/types/database';

export function ProviderCard({ provider }: { provider: ProviderRow }) {
  return (
    <Link
      href={`/providers/${provider.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
        {provider.cover_image_url ? (
          <Image
            src={provider.cover_image_url}
            alt={provider.business_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-brand text-2xl font-display font-bold text-white">
            {provider.business_name.charAt(0)}
          </div>
        )}
        {provider.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary-700 backdrop-blur">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-display font-semibold">{provider.business_name}</h3>
          {provider.verification_status === 'verified' && (
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent" />
          )}
        </div>

        {provider.tagline && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{provider.tagline}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">
              {provider.average_rating > 0 ? provider.average_rating.toFixed(1) : 'New'}
            </span>
            {provider.review_count > 0 && (
              <span className="text-muted-foreground">({provider.review_count})</span>
            )}
          </div>
          <div
            className={cn(
              'flex items-center gap-1 text-xs text-muted-foreground',
              !provider.service_radius_miles && 'invisible'
            )}
          >
            <MapPin className="size-3.5" />
            {provider.service_radius_miles} mi radius
          </div>
        </div>
      </div>
    </Link>
  );
}
