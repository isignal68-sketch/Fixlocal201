export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          role: 'customer' | 'provider' | 'admin';
          city: string | null;
          state: string | null;
          zip_code: string | null;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & { id: string; email: string };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      states: {
        Row: { id: string; name: string; code: string; slug: string };
        Insert: Partial<Database['public']['Tables']['states']['Row']> & { name: string; code: string; slug: string };
        Update: Partial<Database['public']['Tables']['states']['Row']>;
      };
      cities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          state_code: string;
          latitude: number;
          longitude: number;
          population: number | null;
          is_active: boolean;
        };
        Insert: Partial<Database['public']['Tables']['cities']['Row']> & {
          name: string;
          slug: string;
          state_code: string;
          latitude: number;
          longitude: number;
        };
        Update: Partial<Database['public']['Tables']['cities']['Row']>;
      };
      zip_codes: {
        Row: { id: string; zip_code: string; city_id: string; latitude: number; longitude: number };
        Insert: Partial<Database['public']['Tables']['zip_codes']['Row']> & {
          zip_code: string;
          city_id: string;
          latitude: number;
          longitude: number;
        };
        Update: Partial<Database['public']['Tables']['zip_codes']['Row']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string;
          parent_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']> & { name: string; slug: string };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      providers: {
        Row: {
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
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
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
          subscription_tier: 'free' | 'starter' | 'growth' | 'pro';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['providers']['Row']> & {
          user_id: string;
          business_name: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['providers']['Row']>;
      };
      services: {
        Row: {
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
        };
        Insert: Partial<Database['public']['Tables']['services']['Row']> & {
          provider_id: string;
          category_id: string;
          title: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['services']['Row']>;
      };
      photos: {
        Row: {
          id: string;
          provider_id: string;
          url: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['photos']['Row']> & { provider_id: string; url: string };
        Update: Partial<Database['public']['Tables']['photos']['Row']>;
      };
      availability: {
        Row: {
          id: string;
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
        };
        Insert: Partial<Database['public']['Tables']['availability']['Row']> & {
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Update: Partial<Database['public']['Tables']['availability']['Row']>;
      };
      verifications: {
        Row: {
          id: string;
          provider_id: string;
          document_type: string;
          document_url: string;
          status: 'unverified' | 'pending' | 'verified' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['verifications']['Row']> & {
          provider_id: string;
          document_type: string;
          document_url: string;
        };
        Update: Partial<Database['public']['Tables']['verifications']['Row']>;
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string;
          service_id: string;
          status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
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
        };
        Insert: Partial<Database['public']['Tables']['bookings']['Row']> & {
          customer_id: string;
          provider_id: string;
          service_id: string;
          scheduled_at: string;
          address_line1: string;
          city: string;
          state: string;
          zip_code: string;
          price_cents: number;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
      };
      reviews: {
        Row: {
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
        };
        Insert: Partial<Database['public']['Tables']['reviews']['Row']> & {
          booking_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      favorites: {
        Row: { id: string; user_id: string; provider_id: string; created_at: string };
        Insert: Partial<Database['public']['Tables']['favorites']['Row']> & {
          user_id: string;
          provider_id: string;
        };
        Update: Partial<Database['public']['Tables']['favorites']['Row']>;
      };
      conversations: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string;
          booking_id: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['conversations']['Row']> & {
          customer_id: string;
          provider_id: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string | null;
          image_url: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & {
          conversation_id: string;
          sender_id: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string;
          type: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      transactions: {
        Row: {
          id: string;
          booking_id: string;
          stripe_payment_intent_id: string | null;
          amount_cents: number;
          platform_fee_cents: number;
          provider_payout_cents: number;
          status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['transactions']['Row']> & {
          booking_id: string;
          amount_cents: number;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Row']>;
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_method_id: string;
          brand: string;
          last4: string;
          exp_month: number;
          exp_year: number;
          is_default: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payment_methods']['Row']> & {
          user_id: string;
          stripe_payment_method_id: string;
          brand: string;
          last4: string;
          exp_month: number;
          exp_year: number;
        };
        Update: Partial<Database['public']['Tables']['payment_methods']['Row']>;
      };
      subscriptions: {
        Row: {
          id: string;
          provider_id: string;
          tier: 'free' | 'starter' | 'growth' | 'pro';
          status: 'active' | 'past_due' | 'canceled' | 'trialing';
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & { provider_id: string };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
          max_redemptions: number | null;
          times_redeemed: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['coupons']['Row']> & {
          code: string;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
        };
        Update: Partial<Database['public']['Tables']['coupons']['Row']>;
      };
      invoices: {
        Row: {
          id: string;
          booking_id: string;
          invoice_number: string;
          subtotal_cents: number;
          fee_cents: number;
          tax_cents: number;
          total_cents: number;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['invoices']['Row']> & {
          booking_id: string;
          subtotal_cents: number;
          total_cents: number;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Row']>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_provider_id: string | null;
          reported_review_id: string | null;
          reason: string;
          details: string | null;
          status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reports']['Row']> & {
          reporter_id: string;
          reason: string;
        };
        Update: Partial<Database['public']['Tables']['reports']['Row']>;
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          description: string;
          status: 'open' | 'pending' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['support_tickets']['Row']> & {
          user_id: string;
          subject: string;
          description: string;
        };
        Update: Partial<Database['public']['Tables']['support_tickets']['Row']>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['push_subscriptions']['Row']> & {
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
        };
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Row']>;
      };
      automation_events: {
        Row: {
          id: string;
          event_type: string;
          payload: Json;
          status: 'pending' | 'delivered' | 'failed' | 'exhausted';
          attempts: number;
          max_attempts: number;
          next_retry_at: string | null;
          last_error: string | null;
          idempotency_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['automation_events']['Row']> & {
          event_type: string;
          payload: Json;
        };
        Update: Partial<Database['public']['Tables']['automation_events']['Row']>;
      };
      automation_webhook_deliveries: {
        Row: {
          id: string;
          event_id: string;
          attempt_number: number;
          target_url: string;
          request_headers: Json | null;
          response_status: number | null;
          response_body: string | null;
          duration_ms: number | null;
          succeeded: boolean;
          error_message: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['automation_webhook_deliveries']['Row']> & {
          event_id: string;
          attempt_number: number;
          target_url: string;
        };
        Update: Partial<Database['public']['Tables']['automation_webhook_deliveries']['Row']>;
      };
      automation_inbound_events: {
        Row: {
          id: string;
          action: string;
          payload: Json;
          processed: boolean;
          error_message: string | null;
          source_ip: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['automation_inbound_events']['Row']> & {
          action: string;
          payload: Json;
        };
        Update: Partial<Database['public']['Tables']['automation_inbound_events']['Row']>;
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_table: string | null;
          target_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['admin_logs']['Row']> & {
          admin_id: string;
          action: string;
        };
        Update: Partial<Database['public']['Tables']['admin_logs']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: 'customer' | 'provider' | 'admin';
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      owns_provider: {
        Args: { target_provider_id: string };
        Returns: boolean;
      };
      provider_id_for_current_user: {
        Args: Record<string, never>;
        Returns: string;
      };
      nearby_providers: {
        Args: { search_lat: number; search_lng: number; radius_miles?: number };
        Returns: { provider_id: string; distance_miles: number }[];
      };
    };
    Enums: {
      user_role: 'customer' | 'provider' | 'admin';
      booking_status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
      verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    };
  };
}

export type { Timestamps };
