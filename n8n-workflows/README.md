# Example n8n Workflows

These are importable starter workflows demonstrating the FixLocal ↔ n8n
integration described in `/docs/N8N_INTEGRATION.md`. Import via n8n's
**Workflows → Import from File**, then set the required credentials/env
vars before activating.

| File | Covers | Requires |
|---|---|---|
| `booking-lifecycle.json` | `booking.accepted` → SMS + Google Calendar event; `booking.completed` → review-request SMS; `booking.cancelled` → provider alert | Twilio credential, Google Calendar OAuth2 credential |
| `support-ticket-triage.json` | `support_ticket.created` → OpenAI priority classification + suggested reply, written back to FixLocal; urgent tickets also ping Slack | OpenAI credential, Slack credential |
| `provider-and-review-automations.json` | `provider.registered` / `provider.verification_submitted` → Slack alerts; low-rating `review.created` → OpenAI-drafted reply suggestion written back for provider approval | OpenAI credential, Slack credential |

All three share the same signature-verification `Code` node pattern at the
front (`Verify Signature`) and the same webhook path (`fixlocal-events`) —
in a real n8n instance you'd typically merge these into a single workflow
with one Switch node covering every event type, split here only for
readability.

**Environment variables referenced inside these workflows** (set as n8n
environment variables, not committed secrets):

- `N8N_WEBHOOK_SECRET` — verifies inbound signatures from FixLocal
- `N8N_INBOUND_SECRET` — signs outbound callbacks to FixLocal
- `FIXLOCAL_APP_URL` — your deployed FixLocal URL, e.g. `https://fixlocal.com`
- `TWILIO_FROM_NUMBER` — the sending number for SMS nodes

None of these workflows are wired up "live" until you set credentials and
flip `active: true` in n8n — they're safe to import as read-only references.
