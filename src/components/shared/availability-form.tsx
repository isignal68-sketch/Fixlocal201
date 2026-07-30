'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { updateAvailabilityAction } from '@/lib/actions/availability';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { AvailabilityRow } from '@/types/database';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySchedule {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

function buildInitialSchedule(existing: AvailabilityRow[]): DaySchedule[] {
  return DAYS.map((_, i) => {
    const match = existing.find((a) => a.day_of_week === i);
    return {
      dayOfWeek: i,
      isAvailable: match?.is_available ?? (i >= 1 && i <= 5),
      startTime: match?.start_time?.slice(0, 5) ?? '09:00',
      endTime: match?.end_time?.slice(0, 5) ?? '17:00',
    };
  });
}

export function AvailabilityForm({ existing }: { existing: AvailabilityRow[] }) {
  const [schedule, setSchedule] = React.useState<DaySchedule[]>(() => buildInitialSchedule(existing));
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function updateDay(index: number, patch: Partial<DaySchedule>) {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  async function handleSave() {
    setIsSubmitting(true);
    const result = await updateAvailabilityAction(schedule);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not save availability.');
      return;
    }

    toast.success('Availability updated');
  }

  return (
    <div className="max-w-xl space-y-4">
      {schedule.map((day, i) => (
        <div key={day.dayOfWeek} className="flex items-center gap-4 rounded-xl border border-border p-4">
          <Switch
            checked={day.isAvailable}
            onCheckedChange={(checked) => updateDay(i, { isAvailable: checked })}
          />
          <p className="w-24 text-sm font-medium">{DAYS[i]}</p>
          {day.isAvailable ? (
            <div className="flex flex-1 items-center gap-2 text-sm">
              <input
                type="time"
                value={day.startTime}
                onChange={(e) => updateDay(i, { startTime: e.target.value })}
                className="rounded-lg border border-input px-2 py-1.5 text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="time"
                value={day.endTime}
                onChange={(e) => updateDay(i, { endTime: e.target.value })}
                className="rounded-lg border border-input px-2 py-1.5 text-sm"
              />
            </div>
          ) : (
            <p className="flex-1 text-sm text-muted-foreground">Unavailable</p>
          )}
        </div>
      ))}

      <Button onClick={handleSave} isLoading={isSubmitting}>
        Save availability
      </Button>
    </div>
  );
}
