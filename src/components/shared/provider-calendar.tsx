'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ProviderBookingWithDetails } from '@/lib/data/provider-dashboard';

function getMonthMatrix(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const start = new Date(year, month, 1 - startOffset);

  const weeks: Date[][] = [];
  let current = new Date(start);

  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

export function ProviderCalendar({ bookings }: { bookings: ProviderBookingWithDetails[] }) {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const weeks = React.useMemo(
    () => getMonthMatrix(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const bookingsByDay = React.useMemo(() => {
    const map = new Map<string, ProviderBookingWithDetails[]>();
    for (const booking of bookings) {
      const key = new Date(booking.scheduled_at).toDateString();
      map.set(key, [...(map.get(key) ?? []), booking]);
    }
    return map;
  }, [bookings]);

  const today = new Date();

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-semibold">
          {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, i) => {
          const isCurrentMonth = date.getMonth() === cursor.getMonth();
          const isToday = date.toDateString() === today.toDateString();
          const dayBookings = bookingsByDay.get(date.toDateString()) ?? [];

          return (
            <div
              key={i}
              className={cn(
                'min-h-24 rounded-lg border border-border/60 p-1.5 text-xs',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full',
                  isToday && 'bg-primary font-semibold text-primary-foreground'
                )}
              >
                {date.getDate()}
              </span>
              <div className="mt-1 space-y-1">
                {dayBookings.slice(0, 2).map((b) => (
                  <Link
                    key={b.id}
                    href={`/pro/dashboard/bookings/${b.id}`}
                    className="block truncate rounded bg-primary-50 px-1.5 py-0.5 text-primary-700"
                  >
                    {b.customer?.full_name}
                  </Link>
                ))}
                {dayBookings.length > 2 && (
                  <p className="px-1.5 text-muted-foreground">+{dayBookings.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
