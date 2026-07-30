export type UserRole = 'customer' | 'provider' | 'admin';
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type NotificationType =
  | 'booking_request'
  | 'booking_accepted'
  | 'booking_declined'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'new_message'
  | 'new_review'
  | 'review_reply'
  | 'payment_received'
  | 'payment_failed'
  | 'payout_sent'
  | 'system';
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderRow {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  license_number: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  verification_status: VerificationStatus;
  years_in_business: number | null;
  employee_count: number | null;
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  service_radius_miles: number;
  base_latitude: number | null;
  base_longitude: number | null;
  average_rating: number;
  review_count: number;
  completed_jobs_count: number;
  response_time_minutes: number | null;
  is_featured: boolean;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ServiceRow {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  price_type: 'fixed' | 'hourly' | 'quote';
  price_min_cents: number | null;
  price_max_cents: number | null;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CityRow {
  id: string;
  name: string;
  slug: string;
  state_code: string;
  latitude: number;
  longitude: number;
  population: number | null;
  is_active: boolean;
}

export interface StateRow {
  id: string;
  name: string;
  code: string;
  slug: string;
}

export interface ZipCodeRow {
  id: string;
  zip_code: string;
  city_id: string;
  latitude: number;
  longitude: number;
}

export interface BookingRow {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  status: BookingStatus;
  scheduled_at: string;
  duration_minutes: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  notes: string | null;
  price_cents: number;
  platform_fee_cents: number;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewRow {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  photo_urls: string[];
  provider_reply: string | null;
  provider_replied_at: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface FavoriteRow {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  customer_id: string;
  provider_id: string;
  booking_id: string | null;
  last_message_at: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  booking_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  platform_fee_cents: number;
  provider_payout_cents: number;
  status: PaymentStatus;
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  provider_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  created_at: string;
}

export interface CouponRow {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_redemptions: number | null;
  times_redeemed: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  reported_provider_id: string | null;
  reported_review_id: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface VerificationRow {
  id: string;
  provider_id: string;
  document_type: string;
  document_url: string;
  status: VerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PhotoRow {
  id: string;
  provider_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface AvailabilityRow {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface PaymentMethodRow {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}

export interface InvoiceRow {
  id: string;
  booking_id: string;
  invoice_number: string;
  subtotal_cents: number;
  fee_cents: number;
  tax_cents: number;
  total_cents: number;
  pdf_url: string | null;
  created_at: string;
}

export interface SupportTicketRow {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLogRow {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
