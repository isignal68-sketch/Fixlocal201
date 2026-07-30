'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { List, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') === 'map' ? 'map' : 'list';

  function setView(next: 'list' | 'map') {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-xl border border-border p-1">
      <button
        onClick={() => setView('list')}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
          view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <List className="size-4" />
        List
      </button>
      <button
        onClick={() => setView('map')}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
          view === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <MapIcon className="size-4" />
        Map
      </button>
    </div>
  );
}
