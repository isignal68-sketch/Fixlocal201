-- =============================================================================
-- Migration 00006: Payments, Subscriptions, Invoices, Coupons
-- =============================================================================

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stripe_payment_intent_id text,
  amount_cents integer not null check (amount_cents >= 0),
  platform_fee_cents integer not null default 0,
  provider_payout_cents integer not null default 0,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index transactions_booking_id_idx on public.transactions(booking_id);
create index transactions_status_idx on public.transactions(status);
create unique index transactions_stripe_pi_idx on public.transactions(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create table public.payment_methods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_payment_method_id text not null unique,
  brand text not null,
  last4 text not null,
  exp_month integer not null,
  exp_year integer not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index payment_methods_user_id_idx on public.payment_methods(user_id);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null unique references public.providers(id) on delete cascade,
  tier subscription_tier not null default 'free',
  status subscription_status not null default 'active',
  stripe_subscription_id text unique,
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_provider_id_idx on public.subscriptions(provider_id);

create table public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type discount_type not null,
  discount_value integer not null check (discount_value > 0),
  max_redemptions integer,
  times_redeemed integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  invoice_number text not null unique,
  subtotal_cents integer not null,
  fee_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

create index invoices_booking_id_idx on public.invoices(booking_id);

-- Auto-generate a sequential, human-friendly invoice number
create sequence if not exists public.invoice_number_seq start 100000;

create or replace function public.generate_invoice_number()
returns trigger
language plpgsql
as $$
begin
  if new.invoice_number is null then
    new.invoice_number := 'INV-' || nextval('public.invoice_number_seq');
  end if;
  return new;
end;
$$;

create trigger invoices_generate_number
  before insert on public.invoices
  for each row execute function public.generate_invoice_number();
