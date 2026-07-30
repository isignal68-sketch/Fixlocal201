-- =============================================================================
-- Migration 00008: RLS Helper Functions
-- =============================================================================

create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select role = 'admin' from public.users where id = auth.uid()), false);
$$;

create or replace function public.owns_provider(target_provider_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.providers
    where id = target_provider_id and user_id = auth.uid()
  );
$$;

create or replace function public.provider_id_for_current_user()
returns uuid
language sql
stable
security definer set search_path = public
as $$
  select id from public.providers where user_id = auth.uid();
$$;
