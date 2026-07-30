-- =============================================================================
-- Migration 00004: Bookings, Reviews, Favorites
-- =============================================================================

create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.users(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  status booking_status not null default 'pending',
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip_code text not null,
  notes text,
  price_cents integer not null check (price_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  cancellation_reason text,
  cancelled_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_customer_id_idx on public.bookings(customer_id);
create index bookings_provider_id_idx on public.bookings(provider_id);
create index bookings_status_idx on public.bookings(status);
create index bookings_scheduled_at_idx on public.bookings(scheduled_at);

create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  photo_urls text[] not null default '{}',
  provider_reply text,
  provider_replied_at timestamptz,
  is_verified boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_provider_id_idx on public.reviews(provider_id);
create index reviews_customer_id_idx on public.reviews(customer_id);
create index reviews_rating_idx on public.reviews(rating);

-- Keep provider aggregate rating in sync whenever reviews change
create or replace function public.refresh_provider_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_provider_id uuid;
begin
  target_provider_id := coalesce(new.provider_id, old.provider_id);

  update public.providers p
  set
    average_rating = coalesce((
      select round(avg(rating)::numeric, 1) from public.reviews where provider_id = target_provider_id
    ), 0),
    review_count = (
      select count(*) from public.reviews where provider_id = target_provider_id
    )
  where p.id = target_provider_id;

  return coalesce(new, old);
end;
$$;

create trigger reviews_refresh_provider_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_provider_rating();

create table public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, provider_id)
);

create index favorites_user_id_idx on public.favorites(user_id);
create index favorites_provider_id_idx on public.favorites(provider_id);

-- Mark a completed booking's job count on the provider
create or replace function public.increment_completed_jobs()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update public.providers
    set completed_jobs_count = completed_jobs_count + 1
    where id = new.provider_id;
  end if;
  return new;
end;
$$;

create trigger bookings_increment_completed_jobs
  after update on public.bookings
  for each row execute function public.increment_completed_jobs();
