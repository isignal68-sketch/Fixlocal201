'use client';

import * as React from 'react';
import Link from 'next/link';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Star } from 'lucide-react';
import type { ProviderRow } from '@/types/database';

const containerStyle = { width: '100%', height: '100%' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

export function ProviderSearchMap({
  providers,
  center,
}: {
  providers: (ProviderRow & { distance_miles?: number })[];
  center: { lat: number; lng: number };
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const [activeProviderId, setActiveProviderId] = React.useState<string | null>(null);

  const withLocation = providers.filter((p) => p.base_latitude && p.base_longitude);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Map view requires a Google Maps API key to be configured.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="skeleton h-full w-full rounded-2xl" />;
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11} options={mapOptions}>
      {withLocation.map((provider) => (
        <MarkerF
          key={provider.id}
          position={{ lat: provider.base_latitude!, lng: provider.base_longitude! }}
          onClick={() => setActiveProviderId(provider.id)}
        />
      ))}

      {activeProviderId &&
        (() => {
          const provider = withLocation.find((p) => p.id === activeProviderId);
          if (!provider) return null;
          return (
            <InfoWindowF
              position={{ lat: provider.base_latitude!, lng: provider.base_longitude! }}
              onCloseClick={() => setActiveProviderId(null)}
            >
              <Link href={`/providers/${provider.slug}`} className="block w-48 no-underline">
                <p className="font-medium text-foreground">{provider.business_name}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {provider.average_rating > 0 ? provider.average_rating.toFixed(1) : 'New'}
                  {provider.distance_miles !== undefined && (
                    <span>· {Math.round(provider.distance_miles * 10) / 10} mi</span>
                  )}
                </div>
              </Link>
            </InfoWindowF>
          );
        })()}
    </GoogleMap>
  );
}
