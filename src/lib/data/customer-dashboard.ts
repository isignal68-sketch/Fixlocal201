import { createClient } from '@/lib/supabase/server';
import type { BookingRow, FavoriteRow, ReviewRow, InvoiceRow } from '@/types/database';
import type { ProviderRow, ServiceRow } from '@/types/database';

export interface BookingWithDetails extends BookingRow {
  provider: Pick<ProviderRow, 'id' | 'business_name' | 'slug' | 'logo_url' | 'cover_image_url'> | null;
  service: Pick<ServiceRow, 'id' | 'title'> | null;
}

export async function getCustomerBookings(
  customerId: string,
  status?: BookingRow['status']
): Promise<BookingWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('bookings')
    .select(
      '*, provider:providers(id, business_name, slug, logo_url, cover_image_url), service:services(id, title)'
    )
    .eq('customer_id', customerId)
    .order('scheduled_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('getCustomerBookings error', error.message);
    return [];
  }

  return (data as unknown as BookingWithDetails[]) ?? [];
}

export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, provider:providers(id, business_name, slug, logo_url, cover_image_url), service:services(id, title)'
    )
    .eq('id', bookingId)
    .single();

  if (error) return null;
  return data as unknown as BookingWithDetails;
}

export interface FavoriteWithProvider extends FavoriteRow {
  provider: ProviderRow;
}

export async function getCustomerFavorites(userId: string): Promise<FavoriteWithProvider[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('*, provider:providers(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data as unknown as FavoriteWithProvider[]) ?? [];
}

export interface CustomerReviewWithProvider extends ReviewRow {
  provider: Pick<ProviderRow, 'business_name' | 'slug' | 'logo_url'> | null;
}

export async function getCustomerReviews(customerId: string): Promise<CustomerReviewWithProvider[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, provider:providers(business_name, slug, logo_url)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data as unknown as CustomerReviewWithProvider[]) ?? [];
}

export async function getBookingsAwaitingReview(customerId: string): Promise<BookingWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, provider:providers(id, business_name, slug, logo_url, cover_image_url), service:services(id, title)'
    )
    .eq('customer_id', customerId)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false });

  if (error) return [];

  const bookings = (data as unknown as BookingWithDetails[]) ?? [];

  const { data: reviewed } = await supabase
    .from('reviews')
    .select('booking_id')
    .eq('customer_id', customerId);

  const reviewedIds = new Set((reviewed ?? []).map((r) => r.booking_id));
  return bookings.filter((b) => !reviewedIds.has(b.id));
}

export async function getReviewForBooking(bookingId: string): Promise<ReviewRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) return null;
  return data as ReviewRow | null;
}

export interface InvoiceWithBooking extends InvoiceRow {
  booking: Pick<BookingRow, 'id' | 'provider_id' | 'scheduled_at'> & {
    provider: Pick<ProviderRow, 'business_name'> | null;
  };
}

export async function getCustomerInvoices(customerId: string): Promise<InvoiceWithBooking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, booking:bookings!inner(id, provider_id, scheduled_at, customer_id, provider:providers(business_name))')
    .eq('booking.customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data as unknown as InvoiceWithBooking[]) ?? [];
}
