'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidZipCode } from '@/lib/utils';

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [zip, setZip] = React.useState('');
  const [zipError, setZipError] = React.useState<string | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (zip && !isValidZipCode(zip)) {
      setZipError('Enter a valid 5-digit ZIP code');
      return;
    }

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (zip) params.set('zip', zip);
    router.push(`/search?${params.toString()}`);
  }

  function handleUseLocation() {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        params.set('lat', String(position.coords.latitude));
        params.set('lng', String(position.coords.longitude));
        params.set('view', 'map');
        setIsLocating(false);
        router.push(`/search?${params.toString()}`);
      },
      () => setIsLocating(false)
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass glass-border relative flex w-full max-w-xl flex-col gap-2 rounded-2xl p-2 shadow-elevated sm:flex-row"
    >
      <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need help with?"
          className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="hidden h-6 w-px self-center bg-border sm:block" />
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 sm:w-40">
        <MapPin className="size-5 shrink-0 text-muted-foreground" />
        <Input
          value={zip}
          onChange={(e) => {
            setZip(e.target.value);
            setZipError(null);
          }}
          placeholder="ZIP code"
          inputMode="numeric"
          maxLength={5}
          className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={isLocating}
        title="Use my location"
        className="flex shrink-0 items-center justify-center rounded-xl px-2 text-muted-foreground hover:text-primary"
      >
        {isLocating ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
      </button>
      <Button type="submit" size="lg" className="shrink-0">
        Search
      </Button>
      {zipError && (
        <p className="absolute -bottom-6 left-2 text-xs text-destructive">{zipError}</p>
      )}
    </form>
  );
}
