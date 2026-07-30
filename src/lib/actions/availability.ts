'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const dayScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isAvailable: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
});

const availabilitySchema = z.array(dayScheduleSchema);

export interface AvailabilityActionResult {
  success: boolean;
  message?: string;
}

export async function updateAvailabilityAction(
  input: z.infer<typeof availabilitySchema>
): Promise<AvailabilityActionResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Invalid availability data.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!provider) return { success: false, message: 'No provider profile found.' };

  for (const day of parsed.data) {
    if (day.startTime >= day.endTime) {
      return { success: false, message: 'End time must be after start time.' };
    }
  }

  const { error } = await supabase.from('availability').upsert(
    parsed.data.map((day) => ({
      provider_id: provider.id,
      day_of_week: day.dayOfWeek,
      start_time: day.startTime,
      end_time: day.endTime,
      is_available: day.isAvailable,
    })),
    { onConflict: 'provider_id,day_of_week' }
  );

  if (error) return { success: false, message: error.message };

  revalidatePath('/pro/dashboard/settings/availability');
  return { success: true };
}
