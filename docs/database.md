# Platform Admin Database

Platform Admin stores operational snapshots only.

It must not become the canonical owner of customer, reservation, payment, sales, public site, appraisal, SNS post, or AI execution data.

## Tables

- `app_connections`: managed app registry and health status
- `workspace_summaries`: workspace-level operational summary
- `integration_logs`: API, event, AI, Stripe webhook, and error logs
- `contract_statuses`: app contract compliance snapshots
- `contract_documents`: required contract document checklist
- `official_events`: approved event catalog snapshot
- `responsibility_snapshots`: responsibility ownership checklist

## Identity

MVP uses:

- `workspace_id`: `wks_...`
- `owner_user_id`: workspace owner reference

`professionalId` is not required for MVP.

## Security

Row Level Security is enabled on all tables.
MVP does not open browser-side access policies.
Production reads should go through server-side code or a future explicit operator role.
