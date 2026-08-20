# Cloudflare Migration Runbook

This runbook keeps the current Vercel/Supabase production path reversible while Platform Admin moves to Cloudflare Workers + D1 + Clerk.

## Target

- Runtime: Cloudflare Workers via OpenNext
- Snapshot database: D1 binding `DB`, database `platform-admin-snapshots`
- User-facing admin authentication: Clerk
- Transitional service/API fallback: `PLATFORM_ADMIN_API_TOKEN`
- Legacy persistence fallback: Supabase

## 1. Verify Cloudflare authentication

```bash
npm install
npm run cf:whoami
npm run cf:check
```

Do not continue to remote resource operations unless Wrangler is authenticated to the intended Cloudflare account.

## 2. Create D1 once

If `platform-admin-snapshots` does not already exist:

```bash
npx wrangler d1 create platform-admin-snapshots
```

Copy the returned `database_id` into the `DB` entry in `wrangler.jsonc`. Do not invent an ID.

## 3. Apply schema

Local first:

```bash
npm run d1:schema:local
npm run d1:verify:local
```

Then remote:

```bash
npm run d1:schema:remote
npm run d1:verify:remote
```

Expected application tables:

- `app_snapshots`
- `workspace_snapshots`
- `integration_logs`
- `contract_snapshots`

## 4. Generate binding types

```bash
npm run cf-typegen
npm run typecheck
npm run build
npm run deploy:dry-run
```

Do not deploy if typecheck, build, or dry-run fails.

## 5. Configure non-secret variables and secrets

Target production data driver:

```text
SNAPSHOT_DRIVER=d1
```

Clerk target variables:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<configured in deployment environment>
CLERK_SECRET_KEY=<secret>
```

Transitional API token may remain until Clerk-protected admin/API flows are verified:

```text
PLATFORM_ADMIN_API_TOKEN=<secret>
```

Never commit real secret values.

## 6. Preview

```bash
npm run preview
```

Verify public monitoring endpoints remain available according to contracts, and protected admin/API surfaces reject unauthenticated access.

## 7. Persistence roundtrip

With `SNAPSHOT_DRIVER=d1` and authorized admin/API access:

```text
POST /api/persistence/roundtrip
```

Expected:

```json
{
  "roundtripReady": true,
  "driver": "d1"
}
```

The endpoint inserts, reads, and deletes a temporary operational log record.

## 8. Cutover gates

Before production cutover confirm:

- Worker preview loads successfully
- `/health`, `/version`, `/contracts/status` remain compatible
- D1 schema is present remotely
- persistence roundtrip returns `roundtripReady: true`
- Clerk authentication and admin authorization pass
- cross-app health/contract checks pass
- no secrets appear in logs or API responses
- current Vercel/Supabase deployment remains available as rollback

## 9. Rollback

If Cloudflare production verification fails, route users back to the existing Vercel deployment and keep Supabase snapshot persistence enabled. Do not delete Supabase data or revoke legacy production credentials until the migration retention period has passed.
