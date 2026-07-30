-- =============================================================================
-- Migration 00002: Users and Geography Tables
-- =============================================================================

-- Public profile table mirrored 1:1 with auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  avatar_url text,
  phone text,
  role user_role not null default 'customer',
  city text,
  state text,
  zip_code text,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users(role);
create index users_zip_code_idx on public.users(zip_code);

comment on table public.users is 'Public profile data for every authenticated account. 1:1 with auth.users.';

create table public.states (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  slug text not null unique
);

create table public.cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null,
  state_code text not null references public.states(code),
  latitude double precision not null,
  longitude double precision not null,
  population integer,
  is_active boolean not null default true,
  unique (slug, state_code)
);

create index cities_state_code_idx on public.cities(state_code);

alter table public.cities
  add column geog geography(Point, 4326)
  generated always as (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) stored;

create index cities_geog_idx on public.cities using gist (geog);

create table public.zip_codes (
  id uuid primary key default uuid_generate_v4(),
  zip_code text not null unique,
  city_id uuid not null references public.cities(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null
);

create index zip_codes_city_id_idx on public.zip_codes(city_id);

-- Keep updated_at fresh automatically
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Automatically create a public.users row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
