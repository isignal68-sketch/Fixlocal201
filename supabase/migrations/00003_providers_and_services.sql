-- =============================================================================
-- Migration 00003: Providers, Categories, Services
-- =============================================================================

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  icon text not null default 'Wrench',
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index categories_parent_id_idx on public.categories(parent_id);

create table public.providers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  tagline text,
  description text,
  logo_url text,
  cover_image_url text,
  license_number text,
  insurance_provider text,
  insurance_policy_number text,
  verification_status verification_status not null default 'unverified',
  years_in_business integer,
  employee_count integer,
  website_url text,
  instagram_url text,
  facebook_url text,
  service_radius_miles integer not null default 25,
  base_latitude double precision,
  base_longitude double precision,
  average_rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  completed_jobs_count integer not null default 0,
  response_time_minutes integer,
  is_featured boolean not null default false,
  stripe_account_id text,
  stripe_charges_enabled boolean not null default false,
  stripe_payouts_enabled boolean not null default false,
  subscription_tier subscription_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.providers
  add column base_geog geography(Point, 4326)
  generated always as (
    case
      when base_latitude is not null and base_longitude is not null
      then ST_SetSRID(ST_MakePoint(base_longitude, base_latitude), 4326)::geography
      else null
    end
  ) stored;

create index providers_user_id_idx on public.providers(user_id);
create index providers_base_geog_idx on public.providers using gist (base_geog);
create index providers_rating_idx on public.providers(average_rating desc);
create index providers_verification_idx on public.providers(verification_status);
create index providers_name_trgm_idx on public.providers using gin (business_name gin_trgm_ops);

create trigger set_providers_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  slug text not null,
  description text not null default '',
  price_type price_type not null default 'quote',
  price_min_cents integer,
  price_max_cents integer,
  duration_minutes integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, slug),
  constraint price_range_valid check (
    price_max_cents is null or price_min_cents is null or price_max_cents >= price_min_cents
  )
);

create index services_provider_id_idx on public.services(provider_id);
create index services_category_id_idx on public.services(category_id);
create index services_title_trgm_idx on public.services using gin (title gin_trgm_ops);

create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index photos_provider_id_idx on public.photos(provider_id);

create table public.availability (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  unique (provider_id, day_of_week),
  constraint availability_time_valid check (end_time > start_time)
);

create index availability_provider_id_idx on public.availability(provider_id);

create table public.verifications (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  status verification_status not null default 'pending',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index verifications_provider_id_idx on public.verifications(provider_id);
create index verifications_status_idx on public.verifications(status);
