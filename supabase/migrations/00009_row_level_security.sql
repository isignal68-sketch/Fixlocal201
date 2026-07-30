-- =============================================================================
-- Migration 00009: Row Level Security Policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Public can view minimal provider-owner profile fields"
  on public.users for select
  using (
    exists (select 1 from public.providers where providers.user_id = users.id)
  );

create policy "Admins can view all users"
  on public.users for select
  using (public.is_admin());

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));

create policy "Admins can update any user"
  on public.users for update
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- STATES / CITIES / ZIP CODES (public read, admin write)
-- ---------------------------------------------------------------------------
alter table public.states enable row level security;
alter table public.cities enable row level security;
alter table public.zip_codes enable row level security;

create policy "Anyone can read states" on public.states for select using (true);
create policy "Anyone can read active cities" on public.cities for select using (is_active or public.is_admin());
create policy "Anyone can read zip codes" on public.zip_codes for select using (true);

create policy "Admins manage states" on public.states for all using (public.is_admin());
create policy "Admins manage cities" on public.cities for all using (public.is_admin());
create policy "Admins manage zip codes" on public.zip_codes for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- CATEGORIES (public read, admin write)
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;

create policy "Anyone can read active categories"
  on public.categories for select
  using (is_active or public.is_admin());

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- PROVIDERS
-- ---------------------------------------------------------------------------
alter table public.providers enable row level security;

create policy "Anyone can view verified providers"
  on public.providers for select
  using (verification_status = 'verified' or public.owns_provider(id) or public.is_admin());

create policy "Users can create their own provider profile"
  on public.providers for insert
  with check (auth.uid() = user_id);

create policy "Providers can update their own profile"
  on public.providers for update
  using (public.owns_provider(id))
  with check (public.owns_provider(id));

create policy "Admins manage providers"
  on public.providers for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;

create policy "Anyone can view active services"
  on public.services for select
  using (is_active or public.owns_provider(provider_id) or public.is_admin());

create policy "Providers manage their own services"
  on public.services for all
  using (public.owns_provider(provider_id))
  with check (public.owns_provider(provider_id));

create policy "Admins manage all services"
  on public.services for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- PHOTOS
-- ---------------------------------------------------------------------------
alter table public.photos enable row level security;

create policy "Anyone can view provider photos"
  on public.photos for select
  using (true);

create policy "Providers manage their own photos"
  on public.photos for all
  using (public.owns_provider(provider_id))
  with check (public.owns_provider(provider_id));

-- ---------------------------------------------------------------------------
-- AVAILABILITY
-- ---------------------------------------------------------------------------
alter table public.availability enable row level security;

create policy "Anyone can view availability"
  on public.availability for select
  using (true);

create policy "Providers manage their own availability"
  on public.availability for all
  using (public.owns_provider(provider_id))
  with check (public.owns_provider(provider_id));

-- ---------------------------------------------------------------------------
-- VERIFICATIONS
-- ---------------------------------------------------------------------------
alter table public.verifications enable row level security;

create policy "Providers view their own verification docs"
  on public.verifications for select
  using (public.owns_provider(provider_id) or public.is_admin());

create policy "Providers submit their own verification docs"
  on public.verifications for insert
  with check (public.owns_provider(provider_id));

create policy "Admins manage verifications"
  on public.verifications for update
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;

create policy "Customers view their own bookings"
  on public.bookings for select
  using (auth.uid() = customer_id or public.owns_provider(provider_id) or public.is_admin());

create policy "Customers create bookings for themselves"
  on public.bookings for insert
  with check (auth.uid() = customer_id);

create policy "Customers can update limited fields on their bookings"
  on public.bookings for update
  using (auth.uid() = customer_id or public.owns_provider(provider_id) or public.is_admin());

create policy "Admins manage all bookings"
  on public.bookings for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------
alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Customers create reviews for their completed bookings"
  on public.reviews for insert
  with check (
    auth.uid() = customer_id
    and exists (
      select 1 from public.bookings
      where bookings.id = booking_id
        and bookings.customer_id = auth.uid()
        and bookings.status = 'completed'
    )
  );

create policy "Customers can edit their own review"
  on public.reviews for update
  using (auth.uid() = customer_id);

create policy "Providers can reply to their reviews"
  on public.reviews for update
  using (public.owns_provider(provider_id));

create policy "Admins manage all reviews"
  on public.reviews for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- FAVORITES
-- ---------------------------------------------------------------------------
alter table public.favorites enable row level security;

create policy "Users manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- CONVERSATIONS + MESSAGES
-- ---------------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = customer_id or public.owns_provider(provider_id) or public.is_admin());

create policy "Customers can start conversations"
  on public.conversations for insert
  with check (auth.uid() = customer_id);

create policy "Participants can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or public.owns_provider(c.provider_id))
    )
    or public.is_admin()
  );

create policy "Participants can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or public.owns_provider(c.provider_id))
    )
  );

create policy "Participants can mark messages read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or public.owns_provider(c.provider_id))
    )
  );

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "Users view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- ---------------------------------------------------------------------------
-- TRANSACTIONS / PAYMENT METHODS / SUBSCRIPTIONS / INVOICES
-- ---------------------------------------------------------------------------
alter table public.transactions enable row level security;
alter table public.payment_methods enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.coupons enable row level security;

create policy "Participants view their own transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.customer_id = auth.uid() or public.owns_provider(b.provider_id))
    )
    or public.is_admin()
  );

create policy "Admins manage transactions"
  on public.transactions for all
  using (public.is_admin());

create policy "Users manage their own payment methods"
  on public.payment_methods for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Providers view their own subscription"
  on public.subscriptions for select
  using (public.owns_provider(provider_id) or public.is_admin());

create policy "Admins manage subscriptions"
  on public.subscriptions for all
  using (public.is_admin());

create policy "Participants view their own invoices"
  on public.invoices for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.customer_id = auth.uid() or public.owns_provider(b.provider_id))
    )
    or public.is_admin()
  );

create policy "Anyone can validate an active coupon code"
  on public.coupons for select
  using (is_active);

create policy "Admins manage coupons"
  on public.coupons for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- REPORTS / SUPPORT TICKETS / ADMIN LOGS
-- ---------------------------------------------------------------------------
alter table public.reports enable row level security;
alter table public.support_tickets enable row level security;
alter table public.admin_logs enable row level security;

create policy "Users create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users view their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id or public.is_admin());

create policy "Admins manage reports"
  on public.reports for update
  using (public.is_admin());

create policy "Users manage their own support tickets"
  on public.support_tickets for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Only admins can view admin logs"
  on public.admin_logs for select
  using (public.is_admin());

create policy "Only admins can write admin logs"
  on public.admin_logs for insert
  with check (public.is_admin());
