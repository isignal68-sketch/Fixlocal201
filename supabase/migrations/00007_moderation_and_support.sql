-- =============================================================================
-- Migration 00007: Reports, Support Tickets, Admin Logs
-- =============================================================================

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  reported_provider_id uuid references public.providers(id) on delete cascade,
  reported_review_id uuid references public.reviews(id) on delete cascade,
  reason text not null,
  details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint report_target_present check (
    reported_provider_id is not null or reported_review_id is not null
  )
);

create index reports_status_idx on public.reports(status);
create index reports_reported_provider_id_idx on public.reports(reported_provider_id);

create table public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject text not null,
  description text not null,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',
  assigned_to uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_tickets_user_id_idx on public.support_tickets(user_id);
create index support_tickets_status_idx on public.support_tickets(status);

create trigger set_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

create table public.admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index admin_logs_admin_id_idx on public.admin_logs(admin_id);
create index admin_logs_created_at_idx on public.admin_logs(created_at desc);
