'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AdminFilterTabs({
  paramName,
  options,
}: {
  paramName: string;
  options: { label: string; value: string | null }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get(paramName);

  function buildHref(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(paramName, value);
    else params.delete(paramName);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex gap-1 border-b border-border">
      {options.map((opt) => (
        <Link
          key={opt.label}
          href={buildHref(opt.value)}
          className={cn(
            'border-b-2 px-4 py-2.5 text-sm font-medium',
            active === opt.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
