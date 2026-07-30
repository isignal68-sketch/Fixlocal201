'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/lib/data/booking-flow';

export function TimeSlotPicker({
  slotsByDate,
  selectedIso,
  onSelect,
}: {
  slotsByDate: Record<string, TimeSlot[]>;
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}) {
  const dates = Object.keys(slotsByDate).sort();
  const [activeDate, setActiveDate] = React.useState(dates[0] ?? null);

  if (dates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        This provider has no open availability in the next two weeks. Try messaging them directly.
      </p>
    );
  }

  const activeSlots = activeDate ? slotsByDate[activeDate] : [];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((date) => {
          const d = new Date(`${date}T00:00:00`);
          const isActive = date === activeDate;
          return (
            <button
              key={date}
              onClick={() => setActiveDate(date)}
              className={cn(
                'flex shrink-0 flex-col items-center rounded-xl border px-4 py-2.5 text-sm',
                isActive ? 'border-primary bg-primary-50 text-primary-700' : 'border-border hover:bg-secondary'
              )}
            >
              <span className="text-xs text-muted-foreground">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="font-medium">
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {(activeSlots ?? []).map((slot) => (
          <button
            key={slot.iso}
            onClick={() => onSelect(slot.iso)}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm font-medium',
              selectedIso === slot.iso
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-secondary'
            )}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
