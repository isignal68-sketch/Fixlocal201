# FixLocal + n8n Automation Integration

FixLocal's Next.js app never talks to Twilio, Google Calendar, OpenAI, or
sends anything beyond core transactional email itself. Instead, it emits
**signed, logged domain events** to an [n8n](https://n8n.io) instance, and
every cross-system automation (SMS reminders, calendar sync, AI-assisted
support triage, Slack alerts, etc.) is built and maintained entirely inside
n8n workflows. This keeps automation logic out of React components and
server actions, and lets you add or change automations without touching or
redeploying the app.

```
┌─────────────────┐      HTTPS + HMAC       ┌──────────────┐      nodes for      ┌───────────────────────────┐
│  FixLocal (Next) │ ───────────────────────▶│  n8n webhook │─────────────────────▶ Supabase / Stripe / Twilio │
│  server actions  │                          │   trigger    │                      Email / Google Calendar /  │
│  & webhooks      │◀─────────────────────────│  workflows   │◀─────────────────────  OpenAI / Push             │
└─────────────────┘   HTTPS + HMAC (inbound) └──────────────┘                      └───────────────────────────┘
        │
        ▼
 automation_events / automation_webhook_deliveries
        (Supabase — durable log + retry queue)
```

## 1. How an event flows

1. Something happens in the app (a booking is created, a payment succeeds, a
   provider submits a verification document, ...).
2. The relevant server action calls `emitAutomationEvent(eventType, payload)`
   (`src/lib/automation/emit-event.ts`).
3. That function **first** writes a row to `automation_events` (status
   `pending`) — this is the durable source of truth. It then attempts an
   immediate HTTP delivery to `N8N_WEBHOOK_URL`.
4. The request body is signed with HMAC-SHA256 using `N8N_WEBHOOK_SECRET` and
   sent with a 5-second timeout so a slow or down n8n instance never blocks
   the user-facing action that triggered it.
5. Every attempt — success or failure — is logged to
   `automation_webhook_deliveries`. On failure, `automation_events.status`
   becomes `failed` with an exponential backoff `next_retry_at` (1m, 2m, 4m,
   8m, 16m, 32m), or `exhausted` after 6 attempts.
6. `/api/cron/automation-retry` runs every 5 minutes (via Vercel Cron,
   `vercel.json`) and re-delivers anything whose backoff window has elapsed.
7. Admins can watch all of this live at **`/admin/automations`**, including a
   manual "Retry now" button for failed/exhausted events.

Because the event is durably logged *before* delivery is attempted, no event
is ever silently lost — worst case, it sits as `exhausted` and visible in the
admin UI for manual investigation.

## 2. Outbound webhook payload shape

Every event POSTed to `N8N_WEBHOOK_URL` has this envelope:

```json
{
  "eventId": "a1b2c3d4-...",
  "eventType": "booking.created",
  "emittedAt": "2026-07-29T18:42:00.000Z",
  "data": { "...": "event-specific payload, see catalog below" }
}
```

Headers:

| Header | Description |
|---|---|
| `X-FixLocal-Event` | The event type (e.g. `booking.created`) |
| `X-FixLocal-Event-Id` | The `automation_events.id` — use this as your idempotency key inside n8n too |
| `X-FixLocal-Timestamp` | Unix ms timestamp the request was signed at |
| `X-FixLocal-Signature` | `hex(HMAC-SHA256(rawBody, N8N_WEBHOOK_SECRET))` |

**Verifying the signature in n8n:** add a Code node immediately after your
Webhook trigger that recomputes the HMAC over the raw body using the same
secret and compares it to the `X-FixLocal-Signature` header. Reject (respond
401) on mismatch. See `n8n-workflows/booking-lifecycle.json` for a working
example node.

## 3. Event catalog

All event types are defined in `src/lib/automation/event-types.ts` — treat
that file as the canonical schema reference; the table below is a summary.

| Event | Emitted from | Key payload fields |
|---|---|---|
| `user.registered` | `lib/actions/auth.ts` | `userId, email, fullName, role` |
| `provider.registered` | `lib/actions/provider-onboarding.ts` | `providerId, userId, businessName, email, city, state` |
| `provider.verification_submitted` | `lib/actions/verification.ts` | `providerId, verificationId, documentType, businessName` |
| `provider.verification_updated` | `lib/actions/admin-providers.ts` | `providerId, status, businessName, providerEmail` |
| `booking.created` | `lib/actions/create-booking.ts` | full `BookingAutomationContext` (customer + provider contact info, service, address, price) |
| `booking.accepted` | `lib/actions/bookings.ts` | same context shape |
| `booking.declined` | `lib/actions/bookings.ts` | context + `reason` |
| `booking.completed` | `lib/actions/bookings.ts` | same context shape |
| `booking.cancelled` | `lib/actions/bookings.ts` | context + `reason, cancelledBy` |
| `payment.succeeded` / `payment.failed` / `payment.refunded` | `api/webhooks/stripe/route.ts`, `lib/actions/bookings.ts` | `bookingId, paymentIntentId, amountCents, customerId, providerId` |
| `subscription.created` / `.updated` / `.canceled` | `api/webhooks/stripe/route.ts` | `providerId, providerEmail, businessName, tier, stripeSubscriptionId` |
| `review.created` | `lib/actions/reviews.ts` | `reviewId, bookingId, providerId, providerUserId, customerName, rating, comment` |
| `review.replied` | `lib/actions/reviews.ts` | `reviewId, providerId, customerId, reply` |
| `message.sent` | `lib/actions/messages.ts` | `messageId, conversationId, senderId, recipientId, recipientEmail, bodyPreview, hasImage` |
| `support_ticket.created` | `lib/actions/support-tickets.ts` | `ticketId, userId, userEmail, subject, description, priority` |
| `support_ticket.updated` | `lib/actions/admin-moderation.ts` | `ticketId, status, userEmail` |

`booking.created` / `.accepted` / `.completed` all carry the same rich shape
(`BookingAutomationContext` in `lib/automation/booking-context.ts`) so a
single n8n workflow can branch on `eventType` without re-fetching data.

## 4. Setting it up

### 4.1 Deploy n8n

Use [n8n Cloud](https://n8n.io/cloud/) or self-host (Docker, Railway, a
small VPS — n8n is lightweight). Any option works; all that matters is that
it's reachable over HTTPS from your Vercel deployment and can reach back out
to it.

### 4.2 Environment variables

Set these in both the Next.js app (Vercel project settings) and reference
them when building your n8n workflows:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/fixlocal-events
N8N_WEBHOOK_SECRET=<openssl rand -hex 32>      # outbound: FixLocal -> n8n
N8N_INBOUND_SECRET=<openssl rand -hex 32>      # inbound: n8n -> FixLocal (different secret!)
CRON_SECRET=<openssl rand -hex 32>             # protects /api/cron/automation-retry
```

Generate each with e.g. `openssl rand -hex 32`. Never reuse the outbound and
inbound secrets — they protect different trust boundaries.

### 4.3 Build the "FixLocal Events" workflow in n8n

1. Add a **Webhook** node, POST method, path `/fixlocal-events`. Copy its
   production URL into `N8N_WEBHOOK_URL`.
2. Add a **Code** node right after it that verifies `X-FixLocal-Signature`
   against `N8N_WEBHOOK_SECRET` (see the example workflows in
   `/n8n-workflows` for the exact JS).
3. Add a **Switch** node branching on `{{ $json.eventType }}` — one output
   per event type (or group related ones, e.g. all `booking.*`).
4. Wire each branch to the integration nodes you need (Twilio, Google
   Calendar, OpenAI, Gmail/SMTP, HTTP Request for push, etc.) — see §5.
5. Import the starter workflows in `/n8n-workflows/*.json` via n8n's
   **Import from File** to get a working example for the most common cases,
   then extend from there.

### 4.4 Calling back into FixLocal from n8n (optional)

Some workflows want to write a result back (e.g. "OpenAI classified this
ticket as urgent"). POST to:

```
POST https://your-fixlocal-domain.com/api/webhooks/n8n
Content-Type: application/json
X-N8N-Signature: hex(HMAC-SHA256(rawBody, N8N_INBOUND_SECRET))

{ "action": "classify_support_ticket", "payload": { "ticketId": "...", "priority": "urgent" } }
```

The set of allowed `action` values is an explicit allow-list in
`src/app/api/webhooks/n8n/route.ts` — this is intentional. n8n is a trusted
automation layer, not a generic database client; every inbound action has
its own Zod schema and does exactly one well-defined write. To add a new
inbound action, add a case there rather than opening the endpoint up
generically.

## 5. Integration patterns per service

These are patterns to build inside n8n — nothing here lives in the FixLocal
repo beyond the starter workflow exports.

- **Supabase**: n8n has a native Supabase node (or plain HTTP Request against
  PostgREST) for read-side lookups a workflow needs beyond what the event
  payload already includes (e.g. pulling a provider's full service list to
  personalize an SMS).
- **Stripe**: most Stripe-driven automation should react to FixLocal's
  `payment.*` / `subscription.*` events (already fraud/duplicate-checked and
  enriched with booking context) rather than a second raw Stripe webhook —
  avoids double-handling the same event through two different signature
  schemes.
- **Twilio (SMS)**: on `booking.accepted` / a reminder schedule, send an SMS
  to `data.customerPhone`; on delivery-status callback, POST back to
  `/api/webhooks/n8n` with `sms_delivery_status`.
- **Email**: FixLocal already sends core transactional email (confirmations,
  receipts) directly via Resend for reliability on the critical path. Use
  n8n for *supplementary* email — win-back campaigns, provider digest
  summaries, admin alerts — so the two don't compete for the same message.
- **Google Calendar**: on `booking.accepted`, create an event on the
  provider's calendar using the OAuth2 Google Calendar node, then POST the
  created event ID back via `calendar_event_linked` so future
  reschedule/cancel events can update the same calendar entry.
- **OpenAI**: on `support_ticket.created`, classify priority/urgency and
  optionally draft a suggested first reply, POST back via
  `classify_support_ticket`; on `review.created` with a low rating, draft a
  suggested provider reply via `review_reply_suggested` (never auto-posted —
  the provider always approves it from their dashboard).
- **Push notifications**: FixLocal's own Web Push (VAPID) already covers
  device-level push for core events (see `lib/push/send-push.ts`). Use n8n
  push automation for anything that isn't already a first-class in-app
  notification (e.g. a weekly "you have N pending reviews" nudge).

## 6. Adding a new automation

1. Add the event name + payload type to `src/lib/automation/event-types.ts`.
2. Call `emitAutomationEvent('your.event', payload)` from wherever it
   happens — pass an `idempotencyKey` if the action could plausibly run
   twice for the same logical event (webhooks, retried actions).
3. Add a branch for it in your n8n Switch node.
4. That's it — no other code changes, no redeploy required to change *what*
   the automation does, only to change *when* it fires.

## 7. Observability & failure handling

- `/admin/automations` — live status of every emitted event, with filtering
  and a manual retry button.
- `automation_webhook_deliveries` — full request/response audit trail per
  attempt, useful for debugging a misbehaving n8n workflow.
- Retries: exponential backoff, 6 attempts, handled by the cron sweeper —
  no automation is retried indefinitely, and `exhausted` events stay visible
  for manual follow-up rather than disappearing.
- Delivery is deliberately **fire-and-forget from the caller's perspective**:
  a booking is created successfully even if n8n is completely unreachable.
  Automations are an enhancement layer, never a dependency of the core
  product flow.
