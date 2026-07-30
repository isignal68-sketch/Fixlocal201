-- =============================================================================
-- Migration 00012: Nearby Providers RPC (PostGIS radius search)
-- =============================================================================

create or replace function public.nearby_providers(
  search_lat double precision,
  search_lng double precision,
  radius_miles double precision default 50
)
returns table (
  provider_id uuid,
  distance_miles double precision
)
language sql
stable
as $$
  select
    p.id as provider_id,
    ST_Distance(
      p.base_geog,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) / 1609.344 as distance_miles
  from public.providers p
  where p.base_geog is not null
    and p.verification_status = 'verified'
    and ST_DWithin(
      p.base_geog,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      radius_miles * 1609.344
    )
  order by distance_miles asc;
$$;

comment on function public.nearby_providers is
  'Returns verified providers within radius_miles of the given lat/lng, sorted nearest first.';
