'use client';

import { GoogleMap, useJsApiLoader, MarkerF, CircleF } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '100%' };

export function ProviderServiceAreaMap({
  latitude,
  longitude,
  radiusMiles,
}: {
  latitude: number;
  longitude: number;
  radiusMiles: number;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || !isLoaded) {
    return <div className="skeleton h-full w-full rounded-2xl" />;
  }

  const center = { lat: latitude, lng: longitude };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={9}
      options={{ disableDefaultUI: true, clickableIcons: false }}
    >
      <MarkerF position={center} />
      <CircleF
        center={center}
        radius={radiusMiles * 1609.344}
        options={{
          fillColor: '#2563EB',
          fillOpacity: 0.08,
          strokeColor: '#2563EB',
          strokeOpacity: 0.4,
          strokeWeight: 1,
        }}
      />
    </GoogleMap>
  );
}
