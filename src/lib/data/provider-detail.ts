import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type { ServiceRow, PhotoRow, ReviewRow, AvailabilityRow } from '@/types/database';

export async function getProviderServices(providerId: string): Promise<ServiceRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data as ServiceRow[]) ?? [];
}

// This one intentionally keeps the cookie-aware server client: it's used on
// the provider's own dashboard to show inactive services too, which relies
// on the `owns_provider(provider_id)` RLS branch checking auth.uid() against
// the signed-in session — a public/anon client could never satisfy that.
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
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('provider_id', providerId)
    .order('day_of_week', { ascending: true });

  if (error) return [];
  return (data as AvailabilityRow[]) ?? [];
}
