'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export function AdminSearchInput({ placeholder = 'Search...' }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get('q') ?? '');

  const debouncedNavigate = React.useMemo(
    () =>
      debounce((query: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) params.set('q', query);
        else params.delete('q');
        router.push(`${pathname}?${params.toString()}`);
      }, 400),
    [pathname, router, searchParams]
  );

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedNavigate(e.target.value);
        }}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
