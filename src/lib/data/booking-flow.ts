import { createClient } from '@/lib/supabase/server';
import type { ServiceRow, ProviderRow, AvailabilityRow } from '@/types/database';

export interface BookingServiceContext {
  service: ServiceRow;
  provider: ProviderRow;
}

export async function getServiceForBooking(
  providerSlug: string,
  serviceSlug: string
): Promise<BookingServiceContext | null> {
  const supabase = await createClient();

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', providerSlug)
    .single();

  if (!provider) return null;

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', provider.id)
    .eq('slug', serviceSlug)
    .eq('is_active', true)
    .single();

  if (!service) return null;

  return { service: service as ServiceRow, provider: provider as ProviderRow };
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  iso: string;
}

/**
 * Generates bookable time slots for the next N days based on the provider's
 * weekly availability, excluding slots that overlap an existing active booking.
 */
export async function getAvailableSlots(
  providerId: string,
  durationMinutes: number,
  daysAhead = 14
): Promise<Record<string, TimeSlot[]>> {
  const supabase = await createClient();

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_available', true);

  const availabilityByDay = new Map<number, AvailabilityRow>();
  for (const a of (availability as AvailabilityRow[]) ?? []) {
    availabilityByDay.set(a.day_of_week, a);
  }

  const now = new Date();
  const rangeEnd = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('scheduled_at, duration_minutes')
    .eq('provider_id', providerId)
    .in('status', ['pending', 'accepted', 'in_progress'])
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', rangeEnd.toISOString());

  const busyRanges = (existingBookings ?? []).map((b) => {
    const start = new Date(b.scheduled_at).getTime();
    return { start, end: start + b.duration_minutes * 60 * 1000 };
  });

  const slotsByDate: Record<string, TimeSlot[]> = {};

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    day.setHours(0, 0, 0, 0);

    const dayOfWeek = day.getDay();
    const dayAvailability = availabilityByDay.get(dayOfWeek);
    if (!dayAvailability) continue;

    const [startHour = 0, startMin = 0] = dayAvailability.start_time.split(':').map(Number);
    const [endHour = 0, endMin = 0] = dayAvailability.end_time.split(':').map(Number);

    const dayStart = new Date(day);
    dayStart.setHours(startHour, startMin, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(endHour, endMin, 0, 0);

    const slots: TimeSlot[] = [];
    const stepMs = 30 * 60 * 1000;

    for (
      let slotStart = dayStart.getTime();
      slotStart + durationMinutes * 60 * 1000 <= dayEnd.getTime();
      slotStart += stepMs
    ) {
      if (slotStart < now.getTime() + 60 * 60 * 1000) continue; // require 1hr lead time

      const slotEnd = slotStart + durationMinutes * 60 * 1000;
      const overlaps = busyRanges.some((b) => slotStart < b.end && slotEnd > b.start);
      if (overlaps) continue;

      const slotDate = new Date(slotStart);
      const dateKey = slotDate.toISOString().slice(0, 10);
      const timeLabel = slotDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      slots.push({ date: dateKey, time: timeLabel, iso: slotDate.toISOString() });
    }

    if (slots.length > 0) {
      const dateKey = day.toISOString().slice(0, 10);
      slotsByDate[dateKey] = slots;
    }
  }

  return slotsByDate;
}
