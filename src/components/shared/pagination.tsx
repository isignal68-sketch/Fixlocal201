import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(
          'flex size-9 items-center justify-center rounded-lg border border-border',
          currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:bg-secondary'
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((page, idx) => {
        const prevPage = pages[idx - 1];
        const showEllipsis = prevPage !== undefined && page - prevPage > 1;
        return (
          <React.Fragment key={page}>
            {showEllipsis && <span className="px-1 text-muted-foreground">…</span>}
            <Link
              href={buildHref(page)}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg border text-sm font-medium',
                page === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-secondary'
              )}
            >
              {page}
            </Link>
          </React.Fragment>
        );
      })}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(
          'flex size-9 items-center justify-center rounded-lg border border-border',
          currentPage === totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-secondary'
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
