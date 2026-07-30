import { createAdminClient } from '@/lib/supabase/server';

export interface BookingAutomationContext {
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  providerId: string;
  providerUserId: string;
  providerName: string;
  providerEmail: string;
  serviceTitle: string;
  scheduledAt: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  priceCents: number;
}

/**
 * Fetches everything an n8n workflow would plausibly need for a booking
 * event (contact info for SMS/email, service/appointment details for
 * calendar sync) in one query, so every booking.* event carries a rich,
 * consistent payload rather than just IDs the workflow has to look up itself.
 */
export async function getBookingAutomationContext(
  bookingId: string
): Promise<BookingAutomationContext | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('bookings')
    .select(
      `id, customer_id, provider_id, scheduled_at, address_line1, city, state, zip_code, price_cents,
       customer:users!bookings_customer_id_fkey(full_name, email, phone),
       provider:providers(business_name, user_id, users:user_id(email)),
       service:services(title)`
    )
    .eq('id', bookingId)
    .single();

  if (!data) return null;

  const row = data as unknown as {
    id: string;
    customer_id: string;
    provider_id: string;
    scheduled_at: string;
    address_line1: string;
    city: string;
    state: string;
    zip_code: string;
    price_cents: number;
    customer: { full_name: string; email: string; phone: string | null } | null;
    provider: { business_name: string; user_id: string; users: { email: string } | null } | null;
    service: { title: string } | null;
  };

  return {
    bookingId: row.id,
    customerId: row.customer_id,
    customerName: row.customer?.full_name ?? 'Customer',
    customerEmail: row.customer?.email ?? '',
    customerPhone: row.customer?.phone ?? null,
    providerId: row.provider_id,
    providerUserId: row.provider?.user_id ?? '',
    providerName: row.provider?.business_name ?? 'Provider',
    providerEmail: row.provider?.users?.email ?? '',
    serviceTitle: row.service?.title ?? 'Service',
    scheduledAt: row.scheduled_at,
    addressLine1: row.address_line1,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    priceCents: row.price_cents,
  };
}
