# Cloudflare migration

## Target

- Runtime: Cloudflare Workers via OpenNext
- Persistence: Cloudflare D1 `platform-admin`
- Production URL: `https://platform-admin.karukimori.workers.dev`
- D1 binding: `DB`

Platform Admin stores operational snapshots only. Canonical Customer, Reservation, Payment, Sales, Session, Report, PostDraft, Communication and AI Activity data remain owned by their product applications.

## Production workflow

`.github/workflows/cloudflare-production.yml` performs typecheck, Next.js build, Cloudflare authentication, automatic D1 discovery/creation, remote schema application, OpenNext build, Worker deploy, operator-secret configuration, public readiness checks and an authenticated D1 roundtrip.

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `PLATFORM_ADMIN_API_TOKEN`

A D1 database ID secret is intentionally not required: the workflow discovers or creates the `platform-admin` database and injects its ID into the generated deployment configuration.

## Monitoring migration state

Cloudflare production endpoints are now the defaults for:

- AI Platform Core: `https://ai-platform-core.karukimori.workers.dev`
- Communication Planner: `https://communication-planner.karukimori.workers.dev`

Other applications remain configurable through environment variables while their migrations proceed.

## Completion criteria

Migration is complete only when the production workflow is green and confirms `/health`, `/version`, `/contracts/status`, D1 readiness and D1 roundtrip on the Worker production URL.
