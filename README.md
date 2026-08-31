# Platform Admin

Platform Admin は、Professional Studio 系の複数アプリを管理・監視するための運営者専用管理アプリです。

対象アプリ:

- Growth Engine
- Numeria Studio
- Velvet
- SNS Planner
- Communication Planner
- AI Platform Core

## MVP Scope

- Dashboard: 管理対象アプリ、接続状態、contract version、エラー件数、未処理イベント件数
- Apps: 各アプリの repositoryUrl、status、contractVersion、lastSyncAt、healthCheckStatus
- Workspaces: `workspaceId`、`ownerUserId`、Stripe 接続状態、公開サイト状態、利用中アプリ
- Logs: API、イベント、AI実行、Stripe Webhook、エラーログ
- Contracts: contract version、準拠状態、必須ドキュメント、正式イベント名
- Responsibilities: `app-responsibilities.md` の責務分担を表示
- Connection Test: app health / version / contract status を一括監視

## ID Policy

MVPでは `professionalId` を必須IDとして新設しません。

- `workspaceId`: `wks_...` 形式。Customer / Reservation / Payment / Public Site / Sales / Session / Report / PostDraft / Activity / Usage の基本スコープ
- `userId`: ログインしている利用者
- `ownerUserId`: workspace の所有者
- `professionalId`: 将来拡張用

## Responsibility Policy

各アプリは `professional-platform-contracts/docs/contracts/app-responsibilities.md` の責務分担に従います。

- Growth Engine: Customer、Reservation、Stripe payment state、Sales、Public Site、Service/Menu
- Numeria Studio: Session、Report、appraisal work、Report/PDF generation
- Velvet: professional Visit、professional Memory、service notes、Timeline、NextAction
- SNS Planner: PostDraft、simple MessageDraft
- Communication Planner: 1-to-1 Conversation、Message、ConversationContext、ReplyDraft、SafetyCheck、send workflow
- AI Platform Core: Activity、Usage、Capability、AI execution logs
- Platform Admin: Cross-app monitoring、health check、contract compliance、operational snapshots

## Payment Policy

MVPの決済は Stripe のみ対応します。
決済の正本は Growth Engine が持ち、Platform Admin は接続状態、決済状態、エラー、Webhook受信状態を確認します。

## MVP API

Platform Admin のAPIは、正本データを作らず、運営確認用のスナップショットを返します。

- `GET /api/apps`: 管理対象アプリ一覧
- `GET /api/workspaces`: workspace summary 一覧
- `GET /api/logs`: 連携ログ一覧
- `GET /api/logs?status=failed`: ステータス絞り込み
- `GET /api/logs?appName=Growth%20Engine`: アプリ絞り込み
- `GET /api/contracts`: 契約準拠状態、責務分担、正式イベント名
- `GET /api/status`: データソース、Basic認証、環境変数設定状態
- `POST /api/ingest/app-connection`: アプリ接続状態スナップショット登録
- `POST /api/ingest/log`: 連携ログスナップショット登録
- `GET /api/health/growth-engine`: Growth Engine health check
- `GET /api/health/numeria-studio`: Numeria Studio health check
- `GET /api/health/sns-planner`: SNS Planner health check
- `GET /api/health/ai-platform-core`: AI Platform Core health check
- `GET /api/connection-tests`: 監視対象アプリの `/health`、`/version`、`/contracts/status` 一括確認。Growth Engine は Cloudflare Production の `/api/persistence/status` も確認
- `GET /api/persistence/status`: D1/Supabase/mock persistence readiness
- `POST /api/persistence/roundtrip`: D1 write/read roundtrip

## Production Runtime

Production runtime は Cloudflare Workers + OpenNext + Cloudflare D1 を正規経路にします。

- Production URL: `https://platform-admin.karukimori.workers.dev`
- D1 database: `platform-admin`
- Cloudflare schema: `cloudflare/schema.sql`
- Production workflow: `.github/workflows/cloudflare-production.yml`
- Service Bindings: `AI_PLATFORM_CORE_SERVICE`、`COMMUNICATION_PLANNER_SERVICE`

Cloudflare移行は完了済みとして扱い、本体開発では監視・認証・observability・UIを継続改善します。

## Database

D1用スキーマを `cloudflare/schema.sql`、移行期間のPostgreSQL/Supabase想定スキーマを `database/schema.sql` に置いています。

- Platform Admin は運営確認用スナップショットのみ保存
- 正本データは各Canonical Ownerが保持
- RLSは全テーブルで有効
- Production の正規 persistence driver は D1

詳細は `docs/database.md` を参照してください。

## Operations

- `docs/operations.md`: 運用モード、Basic認証、System Status、トラブルシュート
- `docs/deployment-checklist.md`: デプロイ前チェックリスト
- `docs/vercel-deployment.md`: Vercelデプロイ手順
- `docs/ingestion-api.md`: 各アプリからのスナップショット登録API

## Authentication

管理APIは `x-platform-admin-token` による `PLATFORM_ADMIN_API_TOKEN` 保護を正規経路にします。
Basic Auth互換は残していますが、人間向け operator authentication / authorization は未完了です。

API token と人間向けログインは分離して設計します。

## Environment Variables

Productionでは D1 を優先します。Supabase関連設定は移行期間のfallbackです。

- `PLATFORM_ADMIN_PERSISTENCE_DRIVER=d1`
- `PLATFORM_ADMIN_API_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PLATFORM_ADMIN_USERNAME` optional, default: `admin`
- `VELVET_BASE_URL` optional。Velvet のCloudflare Production endpointが確定するまで未設定時は監視を skipped とする

`SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` は fallback 用です。Productionの正規経路は D1 です。

設定例は `.env.example` を参照してください。

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run smoke
```

`npm run smoke` は `PLATFORM_ADMIN_BASE_URL` を未設定の場合 `http://127.0.0.1:3000` に対して主要APIを確認します。
実行前に `npm run dev` または `npm run start` でPlatform Adminを起動してください。
