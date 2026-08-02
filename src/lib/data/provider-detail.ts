import { createClient } from '@/lib/supabase/server';
import type { ServiceRow, PhotoRow, ReviewRow, AvailabilityRow } from '@/types/database';

export async function getProviderServices(providerId: string): Promise<ServiceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data as ServiceRow[]) ?? [];
}

export async function getAllProviderServices(providerId: string): Promise<ServiceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data as ServiceRow[]) ?? [];
}

export async function getProviderPhotos(providerId: string): Promise<PhotoRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('provider_id', providerId)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data as PhotoRow[]) ?? [];
}

export interface ReviewWithCustomer extends ReviewRow {
  customer_name?: string;
  customer_avatar?: string | null;
}

export async function getProviderReviews(providerId: string, limit = 20): Promise<ReviewWithCustomer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users:customer_id(full_name, avatar_url)')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];

  return ((data ?? []) as unknown as Array<ReviewRow & { users: { full_name: string; avatar_url: string | null } | null }>).map(
    (row) => ({
      ...row,
      customer_name: row.users?.full_name ?? 'FixLocal customer',
      customer_avatar: row.users?.avatar_url ?? null,
    })
  );
}

export async function getProviderAvailability(providerId: string): Promise<AvailabilityRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('provider_id', providerId)
    .order('day_of_week', { ascending: true });

  if (error) return [];
  return (data as AvailabilityRow[]) ?? [];
}
