import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, BadgeCheck, MapPin, Clock, Briefcase, MessageCircle } from 'lucide-react';
import { getProviderBySlug } from '@/lib/data/providers';
import {
  getProviderServices,
  getProviderPhotos,
  getProviderReviews,
} from '@/lib/data/provider-detail';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { createClient } from '@/lib/supabase/server';
import { ServiceList } from '@/components/shared/service-list';
import { PhotoGallery } from '@/components/shared/photo-gallery';
import { ReviewsList } from '@/components/shared/reviews-list';
import { RatingBreakdown } from '@/components/shared/rating-breakdown';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { ReportDialog } from '@/components/shared/report-dialog';
import { ProviderServiceAreaMap } from '@/components/shared/provider-service-area-map';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

interface ProviderPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) return {};

  return {
    title: `${provider.business_name} — Reviews, pricing & booking`,
    description:
      provider.tagline ??
      `Book ${provider.business_name} on FixLocal. ${provider.review_count} verified reviews.`,
    alternates: { canonical: `${siteConfig.url}/providers/${provider.slug}` },
    openGraph: {
      images: provider.cover_image_url ? [provider.cover_image_url] : undefined,
    },
  };
}

export const revalidate = 600;

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);

  if (!provider) notFound();

  const [services, photos, reviews, user] = await Promise.all([
    getProviderServices(provider.id),
    getProviderPhotos(provider.id),
    getProviderReviews(provider.id),
    getCurrentUser(),
  ]);
  const firstService = services[0];

  let isFavorited = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider_id', provider.id)
      .maybeSingle();
    isFavorited = !!data;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.business_name,
    image: provider.cover_image_url ?? provider.logo_url ?? undefined,
    aggregateRating:
      provider.review_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: provider.average_rating,
            reviewCount: provider.review_count,
          }
        : undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative h-56 w-full overflow-hidden bg-secondary sm:h-72">
        {provider.cover_image_url ? (
          <Image
            src={provider.cover_image_url}
            alt={provider.business_name}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-gradient-brand" />
        )}
      </div>

      <div className="container -mt-14 pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-background shadow-elevated">
                  {provider.logo_url ? (
                    <Image
                      src={provider.logo_url}
                      alt={provider.business_name}
                      width={96}
                      height={96}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-brand font-display text-2xl font-bold text-white">
                      {provider.business_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold sm:text-3xl">
                      {provider.business_name}
                    </h1>
                    {provider.verification_status === 'verified' && (
                      <BadgeCheck className="size-5 text-accent" aria-label="Verified provider" />
                    )}
                  </div>
                  {provider.tagline && (
                    <p className="mt-1 text-muted-foreground">{provider.tagline}</p>
                  )}
                </div>
              </div>

              <FavoriteButton
                providerId={provider.id}
                userId={user?.id ?? null}
                initialFavorited={isFavorited}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">
                  {provider.average_rating > 0 ? provider.average_rating.toFixed(1) : 'New'}
                </span>
                <span className="text-muted-foreground">({provider.review_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="size-4" />
                {provider.completed_jobs_count} jobs completed
              </div>
              {provider.response_time_minutes && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-4" />
                  Responds in ~{provider.response_time_minutes} min
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" />
                {provider.service_radius_miles} mi service area
              </div>
            </div>

            {provider.description && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold">About</h2>
                <p className="mt-2 whitespace-pre-line text-muted-foreground">
                  {provider.description}
                </p>
              </div>
            )}

            <div className="mt-10">
              <h2 className="mb-4 font-display text-lg font-semibold">Services</h2>
              <ServiceList services={services} providerSlug={provider.slug} />
            </div>

            {photos.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 font-display text-lg font-semibold">Photos</h2>
                <PhotoGallery photos={photos} />
              </div>
            )}

            {provider.base_latitude && provider.base_longitude && (
              <div className="mt-10">
                <h2 className="mb-4 font-display text-lg font-semibold">Service area</h2>
                <div className="h-64 overflow-hidden rounded-2xl border border-border">
                  <ProviderServiceAreaMap
                    latitude={provider.base_latitude}
                    longitude={provider.base_longitude}
                    radiusMiles={provider.service_radius_miles}
                  />
                </div>
              </div>
            )}

            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Reviews</h2>
                <ReportDialog providerId={provider.id} triggerLabel="Report this business" />
              </div>
              {reviews.length > 0 && (
                <div className="mb-6 max-w-xs">
                  <RatingBreakdown reviews={reviews} />
                </div>
              )}
              <ReviewsList reviews={reviews} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-border p-6 shadow-card">
              <p className="font-display text-lg font-semibold">Ready to book?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a service to see availability and pricing.
              </p>
              <Button asChild className="mt-4 w-full" size="lg">
                <Link href={firstService ? `/book/${provider.slug}/${firstService.slug}` : '#'}>
                  Book now
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href={user ? `/dashboard/messages?provider=${provider.id}` : '/login'}>
                  <MessageCircle className="size-4" />
                  Message
                </Link>
              </Button>

              {(provider.license_number || provider.insurance_provider) && (
                <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
                  {provider.license_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License</span>
                      <span className="font-medium">Verified on file</span>
                    </div>
                  )}
                  {provider.insurance_provider && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Insurance</span>
                      <span className="font-medium">Verified on file</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
