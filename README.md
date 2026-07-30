# FixLocal

A production-shaped local-services marketplace (Next.js 15, React 18, TypeScript, Tailwind, shadcn/ui, Supabase, Stripe, and n8n for automation).

## Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Database/Auth/Storage/Realtime**: Supabase (Postgres + PostGIS, Row Level Security throughout)
- **Payments**: Stripe (Connect for provider payouts, Checkout for subscriptions, manual-capture PaymentIntents for bookings)
- **Automation**: n8n, driven by a signed event system — see [`docs/N8N_INTEGRATION.md`](./docs/N8N_INTEGRATION.md)
- **Email**: Resend (transactional) + n8n (supplementary/marketing)
- **Push**: Web Push (VAPID)
- **Maps**: Google Maps JS API + PostGIS proximity search

## Getting started

### 1. Install dependencies

```bash
npm install
```

**Note on the React version pin:** this project intentionally pins `react`
and `react-dom` to `18.3.1` (not 19) via both the top-level dependency
version and a package.json `overrides` block. Several UI dependencies
(`recharts`, `@stripe/react-stripe-js`, `vaul`) pin their peer dependency
range to `^16.8 || ^17.0 || ^18.0` and don't yet declare React 19 support,
which causes an `ERESOLVE` install failure on npm 7+ (including Vercel's
build environment) if `react`/`react-dom` are on 19.x. Next.js 15 itself
supports React 18.2+ just fine, so there's no functional downside — nothing
in this codebase uses a React 19-only API (`useActionState`,
`useFormStatus`, `useOptimistic`, the `<Context value>` shorthand). An
`.npmrc` with `legacy-peer-deps=true` is also included as a defensive
fallback. If you upgrade any of the three packages above to a version that
declares React 19 support, the pin can be safely removed.

### 2. Set up Supabase

```bash
npx supabase init          # if not already linked
npx supabase link --project-ref <your-project-ref>
npx supabase db push       # applies every migration in supabase/migrations
npx supabase db seed       # or: psql < supabase/seed.sql
```

This creates every table, enum, RLS policy, storage bucket, and the
`nearby_providers` PostGIS function. Row Level Security is enabled on every
table — the app never needs to disable it, including for the admin
dashboard (admins are granted access via `is_admin()`-gated policies, not by
bypassing RLS).

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in every value. At minimum, to
run locally you need:

- Supabase project URL + anon key + service role key
- A Stripe test-mode secret/publishable key pair (webhook secret can be
  generated with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- A Resend API key (or leave blank — transactional email calls fail silently
  in development)

n8n, Twilio, Google Calendar, OpenAI, and VAPID push keys are all optional
for local development — every integration that depends on them degrades
gracefully (events are still logged to `automation_events`, just not
delivered) rather than breaking the app.

### 4. Run the dev server

```bash
npm run dev
```

### 5. Type-check and lint before committing

```bash
npm run type-check
npm run lint
```

## Project structure

```
src/
  app/                  Routes (App Router): marketing pages, auth, customer
                         dashboard, provider dashboard, admin dashboard, API routes
  components/
    ui/                 shadcn/ui primitives
    layout/             Navbar, footer, dashboard sidebars
    shared/              Feature components (forms, dialogs, cards, maps, chat)
  lib/
    actions/             Server Actions — one file per domain area
    data/                Read-only data-access functions (server-side Supabase queries)
    automation/          The n8n event system (see below)
    stripe/, email/, push/, invoices/, admin/
  types/                 Hand-authored Database types + shared domain types
supabase/
  migrations/            Every schema change, in order, as plain SQL
  seed.sql                Categories, states, cities, ZIP codes, starter coupons
n8n-workflows/            Importable example n8n workflows
docs/
  N8N_INTEGRATION.md      Full automation architecture + event catalog
```

## Automation layer (n8n)

FixLocal emits signed, durably-logged domain events (user/provider
registration, booking lifecycle, payments, subscriptions, reviews, messages,
support tickets, verification) to an n8n instance rather than embedding
Twilio/Calendar/OpenAI/Slack logic in the app itself. See
[`docs/N8N_INTEGRATION.md`](./docs/N8N_INTEGRATION.md) for the full
architecture, the event payload catalog, retry/failure handling, and how to
add a new automation. Live delivery status and a manual retry control are
available to admins at `/admin/automations`.

## Deployment (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add every variable from `.env.example` to the Vercel project's
   Environment Variables (Production + Preview).
3. Set the Stripe webhook endpoint to
   `https://<your-domain>/api/webhooks/stripe` and copy its signing secret
   into `STRIPE_WEBHOOK_SECRET`.
4. `vercel.json` already defines the automation-retry Cron Job
   (`/api/cron/automation-retry`, every 5 minutes) — Vercel picks this up
   automatically on deploy as long as `CRON_SECRET` is set.
5. Deploy. Run the Supabase migrations against your production project
   before or immediately after the first deploy (`npx supabase db push`
   against the production project ref).

### What I could not verify myself

This project was generated in a sandboxed environment without network
access, so I was not able to run `npm install`, a real `next build`, or
execute the SQL migrations against a live Supabase project. Please run
`npm install && npm run build` and `npx supabase db push` yourself before
your first deploy to catch anything environment-specific that couldn't be
checked here.
