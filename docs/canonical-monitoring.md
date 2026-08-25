# Canonical Monitoring

Platform Admin monitors operational snapshots only. It must not become the source of truth for Customer, Reservation, Payment, Sales, Report, Message, ConversationContext, Professional Memory, PostDraft, MessageDraft, AI Activity, API keys, or secret prompts.

## Canonical Production Endpoints

Cloudflare-migrated apps use Production endpoints as the canonical monitoring target.

| App | Canonical base URL | Monitoring transport |
| --- | --- | --- |
| Platform Admin | `https://platform-admin.karukimori.workers.dev` | HTTPS |
| AI Platform Core | `https://ai-platform-core.karukimori.workers.dev` | Cloudflare Service Binding when available |
| Communication Planner | `https://communication-planner.karukimori.workers.dev` | Cloudflare Service Binding when available |
| Growth Engine | `https://growth-engine-ruby-nine.vercel.app` | HTTPS |
| SNS Planner | `https://sns-planner.illusionddt.chatgpt.site` | HTTPS |
| Numeria Studio | `https://numeria-studio.illusionddt.chatgpt.site` | HTTPS |
| Velvet | unset | `skipped` until `VELVET_BASE_URL` is configured |

Old preview URLs must not be used as canonical monitoring snapshots for migrated apps.

## Required Checks

For each app, Platform Admin checks:

- `GET /health`
- `GET /version`
- `GET /contracts/status`

When available, app-specific readiness checks should also be shown without storing canonical business records:

- persistence readiness
- integration readiness
- event readiness
- observability fields such as `traceId`, `correlationId`, `requestId`, `eventName`, `errorCode`, `statusCode`, `durationMs`, and `occurredAt`

## Known Pending Item

Velvet is a formal Professional App, but its Cloudflare Production monitoring endpoint is not canonical in Platform Admin yet. Until `VELVET_BASE_URL` is configured, `/api/connection-tests` returns a `SKIPPED` row with `VELVET_BASE_URL_NOT_CONFIGURED`.

This is not a Platform Admin Cloudflare migration failure.
