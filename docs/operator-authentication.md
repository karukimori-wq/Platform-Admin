# Operator Authentication

Platform Admin currently protects management APIs with `PLATFORM_ADMIN_API_TOKEN` through the `x-platform-admin-token` header. Basic Auth compatibility remains for older clients.

This is not the final human operator authentication model.

## Current State

- API token protection: implemented
- Basic Auth compatibility: implemented
- Cloudflare Worker compatibility: implemented without Node.js `Buffer`
- Human operator login: pending
- Operator authorization roles: pending
- Audit trail for human actions: pending

## Design Direction

API-to-API protection and human operator login should remain separate.

Recommended split:

- `x-platform-admin-token`: machine/admin API ingestion and automation
- operator session: browser UI access by a human operator
- audit record: human action logs with operator identity, operation, status, and timestamp

## Non-Goals

Platform Admin must not implement general end-user auth for customer, professional, or requester-facing workflows.

It also must not store canonical customer data, payment data, sales data, report bodies, message bodies, conversation context bodies, Professional Memory bodies, API keys, or secret prompts as part of authentication or audit records.

## Next Implementation Step

Choose a Cloudflare-compatible operator login strategy, then protect the dashboard UI separately from API-token-protected ingestion endpoints.
