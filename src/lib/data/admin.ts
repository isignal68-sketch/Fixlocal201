import { createClient } from '@/lib/supabase/server';
import type { UserRow, ProviderRow, BookingRow, ReportRow, SupportTicketRow, AdminLogRow } from '@/types/database';

export interface PlatformStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenueCents: number;
  monthRevenueCents: number;
  pendingVerifications: number;
  openReports: number;
  openTickets: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalProviders },
    { count: totalBookings },
    { data: completedBookings },
    { count: pendingVerifications },
    { count: openReports },
    { count: openTickets },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('providers').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('price_cents, created_at').eq('status', 'completed'),
    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const totalRevenueCents = (completedBookings ?? []).reduce((sum, b) => sum + b.price_cents, 0);
  const monthRevenueCents = (completedBookings ?? [])
    .filter((b) => new Date(b.created_at) >= startOfMonth)
    .reduce((sum, b) => sum + b.price_cents, 0);

  return {
    totalUsers: totalUsers ?? 0,
    totalProviders: totalProviders ?? 0,
    totalBookings: totalBookings ?? 0,
    totalRevenueCents,
    monthRevenueCents,
    pendingVerifications: pendingVerifications ?? 0,
    openReports: openReports ?? 0,
    openTickets: openTickets ?? 0,
  };
}

export interface PlatformRevenuePoint {
  label: string;
  revenueCents: number;
  feeCents: number;
}

export async function getPlatformRevenueSeries(months = 6): Promise<PlatformRevenuePoint[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const { data } = await supabase
    .from('bookings')
    .select('price_cents, platform_fee_cents, created_at')
    .eq('status', 'completed')
    .gte('created_at', since.toISOString());

  const buckets = new Map<string, { revenue: number; fee: number }>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    buckets.set(d.toLocaleDateString('en-US', { month: 'short' }), { revenue: 0, fee: 0 });
  }

  for (const booking of data ?? []) {
    const key = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short' });
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.revenue += booking.price_cents;
      bucket.fee += booking.platform_fee_cents;
    }
  }

  return Array.from(buckets.entries()).map(([label, v]) => ({
    label,
    revenueCents: v.revenue,
    feeCents: v.fee,
  }));
}

export async function getAllUsers(search?: string): Promise<UserRow[]> {
  const supabase = await createClient();
  let query = supabase.from('users').select('*').order('created_at', { ascending: false }).limit(200);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as UserRow[]) ?? [];
}

export async function getAllProviders(status?: string): Promise<ProviderRow[]> {
  const supabase = await createClient();
  let query = supabase.from('providers').select('*').order('created_at', { ascending: false }).limit(200);

  if (status) {
    query = query.eq('verification_status', status);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data as ProviderRow[]) ?? [];
}

export interface AdminBookingWithNames extends BookingRow {
  customer_name?: string;
  provider_name?: string;
}

export async function getAllBookings(status?: string): Promise<AdminBookingWithNames[]> {
  const supabase = await createClient();
  let query = supabase
    .from('bookings')
    .select('*, customer:users!bookings_customer_id_fkey(full_name), provider:providers(business_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return [];

  return ((data ?? []) as unknown as Array<
    BookingRow & { customer: { full_name: string } | null; provider: { business_name: string } | null }
  >).map((row) => ({
    ...row,
    customer_name: row.customer?.full_name,
    provider_name: row.provider?.business_name,
  }));
}

export interface ReportWithDetails extends ReportRow {
  reporter_name?: string;
  reported_provider_name?: string;
}

export async function getOpenReports(): Promise<ReportWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*, reporter:users!reports_reporter_id_fkey(full_name), reported_provider:providers(business_name)')
    .order('created_at', { ascending: false });

  if (error) return [];

  return ((data ?? []) as unknown as Array<
    ReportRow & { reporter: { full_name: string } | null; reported_provider: { business_name: string } | null }
  >).map((row) => ({
    ...row,
    reporter_name: row.reporter?.full_name,
    reported_provider_name: row.reported_provider?.business_name,
  }));
}

export async function getSupportTickets(status?: string): Promise<SupportTicketRow[]> {
  const supabase = await createClient();
  let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return [];
  return (data as SupportTicketRow[]) ?? [];
}

export async function getAdminLogs(limit = 100): Promise<AdminLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as AdminLogRow[]) ?? [];
}
