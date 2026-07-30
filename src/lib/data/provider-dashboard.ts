import { createClient } from '@/lib/supabase/server';
import type { ProviderRow, BookingRow, UserRow, ServiceRow } from '@/types/database';

export async function getProviderForUser(userId: string): Promise<ProviderRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return null;
  return data as ProviderRow | null;
}

export interface ProviderBookingWithDetails extends BookingRow {
  customer: Pick<UserRow, 'id' | 'full_name' | 'avatar_url' | 'phone'> | null;
  service: Pick<ServiceRow, 'id' | 'title'> | null;
}

export async function getProviderBookings(
  providerId: string,
  status?: BookingRow['status']
): Promise<ProviderBookingWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('bookings')
    .select('*, customer:users!bookings_customer_id_fkey(id, full_name, avatar_url, phone), service:services(id, title)')
    .eq('provider_id', providerId)
    .order('scheduled_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('getProviderBookings error', error.message);
    return [];
  }

  return (data as unknown as ProviderBookingWithDetails[]) ?? [];
}

export async function getProviderBookingById(
  bookingId: string
): Promise<ProviderBookingWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:users!bookings_customer_id_fkey(id, full_name, avatar_url, phone), service:services(id, title)')
    .eq('id', bookingId)
    .single();

  if (error) return null;
  return data as unknown as ProviderBookingWithDetails;
}

export interface ProviderStats {
  totalRevenueCents: number;
  monthRevenueCents: number;
  completedJobs: number;
  pendingRequests: number;
  averageRating: number;
  reviewCount: number;
  newCustomers30d: number;
}

export async function getProviderStats(providerId: string): Promise<ProviderStats> {
  const supabase = await createClient();

  const [{ data: provider }, { data: bookings }, { count: pendingCount }] = await Promise.all([
    supabase.from('providers').select('average_rating, review_count, completed_jobs_count').eq('id', providerId).single(),
    supabase
      .from('bookings')
      .select('price_cents, platform_fee_cents, created_at, customer_id, status')
      .eq('provider_id', providerId)
      .eq('status', 'completed'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'pending'),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const completedBookings = bookings ?? [];

  const totalRevenueCents = completedBookings.reduce(
    (sum, b) => sum + (b.price_cents - b.platform_fee_cents),
    0
  );
  const monthRevenueCents = completedBookings
    .filter((b) => new Date(b.created_at) >= startOfMonth)
    .reduce((sum, b) => sum + (b.price_cents - b.platform_fee_cents), 0);

  const newCustomerIds = new Set(
    completedBookings.filter((b) => new Date(b.created_at) >= thirtyDaysAgo).map((b) => b.customer_id)
  );

  return {
    totalRevenueCents,
    monthRevenueCents,
    completedJobs: provider?.completed_jobs_count ?? 0,
    pendingRequests: pendingCount ?? 0,
    averageRating: provider?.average_rating ?? 0,
    reviewCount: provider?.review_count ?? 0,
    newCustomers30d: newCustomerIds.size,
  };
}

export interface RevenueDataPoint {
  label: string;
  revenueCents: number;
}

export async function getProviderRevenueSeries(providerId: string, months = 6): Promise<RevenueDataPoint[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const { data } = await supabase
    .from('bookings')
    .select('price_cents, platform_fee_cents, created_at')
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .gte('created_at', since.toISOString());

  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    const key = d.toLocaleDateString('en-US', { month: 'short' });
    buckets.set(key, 0);
  }

  for (const booking of data ?? []) {
    const d = new Date(booking.created_at);
    const key = d.toLocaleDateString('en-US', { month: 'short' });
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + (booking.price_cents - booking.platform_fee_cents));
    }
  }

  return Array.from(buckets.entries()).map(([label, revenueCents]) => ({ label, revenueCents }));
}

export interface ProviderCustomer {
  customerId: string;
  fullName: string;
  avatarUrl: string | null;
  totalBookings: number;
  totalSpentCents: number;
  lastBookingAt: string;
}

export async function getProviderCustomers(providerId: string): Promise<ProviderCustomer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bookings')
    .select('customer_id, price_cents, created_at, customer:users!bookings_customer_id_fkey(full_name, avatar_url)')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  const map = new Map<string, ProviderCustomer>();

  for (const row of (data ?? []) as unknown as Array<{
    customer_id: string;
    price_cents: number;
    created_at: string;
    customer: { full_name: string; avatar_url: string | null } | null;
  }>) {
    const existing = map.get(row.customer_id);
    if (existing) {
      existing.totalBookings += 1;
      existing.totalSpentCents += row.price_cents;
    } else {
      map.set(row.customer_id, {
        customerId: row.customer_id,
        fullName: row.customer?.full_name ?? 'Customer',
        avatarUrl: row.customer?.avatar_url ?? null,
        totalBookings: 1,
        totalSpentCents: row.price_cents,
        lastBookingAt: row.created_at,
      });
    }
  }

  return Array.from(map.values());
}
