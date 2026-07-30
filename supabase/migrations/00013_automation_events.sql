-- =============================================================================
-- Migration 00013: Automation Event System (n8n integration)
-- =============================================================================

create type automation_event_status as enum ('pending', 'delivered', 'failed', 'exhausted');

-- Immutable record of every domain event the platform has emitted, regardless
-- of whether delivery to n8n succeeded. This is the source of truth an admin
-- (or a replay script) can use to see "what happened" independent of
-- "did the webhook call succeed".
create table public.automation_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  payload jsonb not null,
  status automation_event_status not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 6,
  next_retry_at timestamptz,
  last_error text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index automation_events_status_idx on public.automation_events(status);
create index automation_events_event_type_idx on public.automation_events(event_type);
create index automation_events_next_retry_idx on public.automation_events(next_retry_at)
  where status = 'failed';
create index automation_events_created_at_idx on public.automation_events(created_at desc);

create trigger set_automation_events_updated_at
  before update on public.automation_events
  for each row execute function public.set_updated_at();

-- One row per HTTP delivery attempt (an event may have several if it retries).
-- This is the audit trail / "automation logs" surface for admins.
create table public.automation_webhook_deliveries (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.automation_events(id) on delete cascade,
  attempt_number integer not null,
  target_url text not null,
  request_headers jsonb,
  response_status integer,
  response_body text,
  duration_ms integer,
  succeeded boolean not null default false,
  error_message text,
  created_at timestamptz not null default now()
);

create index automation_webhook_deliveries_event_id_idx on public.automation_webhook_deliveries(event_id);
create index automation_webhook_deliveries_created_at_idx on public.automation_webhook_deliveries(created_at desc);

-- Inbound calls FROM n8n back into FixLocal (e.g. "AI classified this ticket
-- as urgent", "SMS delivery confirmed"). Logged separately from outbound
-- deliveries so the two directions of the integration are each auditable.
create table public.automation_inbound_events (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  payload jsonb not null,
  processed boolean not null default false,
  error_message text,
  source_ip text,
  created_at timestamptz not null default now()
);

create index automation_inbound_events_action_idx on public.automation_inbound_events(action);
create index automation_inbound_events_created_at_idx on public.automation_inbound_events(created_at desc);

alter table public.automation_events enable row level security;
alter table public.automation_webhook_deliveries enable row level security;
alter table public.automation_inbound_events enable row level security;

create policy "Admins view automation events"
  on public.automation_events for select
  using (public.is_admin());

create policy "Admins view automation deliveries"
  on public.automation_webhook_deliveries for select
  using (public.is_admin());

create policy "Admins view inbound automation events"
  on public.automation_inbound_events for select
  using (public.is_admin());

-- Writes to these tables happen exclusively through the service-role client
-- from trusted server code (emit-event.ts, the retry sweeper, and the
-- n8n inbound webhook route) — no direct client access is granted.

alter publication supabase_realtime add table public.automation_events;
