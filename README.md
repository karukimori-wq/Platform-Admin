# Platform Admin

Platform Admin は、Professional Studio 系の複数アプリを管理・監視するための運営者専用管理アプリです。

対象アプリ:

- Growth Engine
- Professional Studio
- SNS Planner
- AI Platform Core

## MVP Scope

- Dashboard: 管理対象アプリ、接続状態、contract version、エラー件数、未処理イベント件数
- Apps: 各アプリの repositoryUrl、status、contractVersion、lastSyncAt、healthCheckStatus
- Workspaces: `workspaceId`、`ownerUserId`、Stripe 接続状態、公開サイト状態、利用中アプリ
- Logs: API、イベント、AI実行、Stripe Webhook、エラーログ
- Contracts: contract version、準拠状態、必須ドキュメント、正式イベント名
- Responsibilities: `app-responsibilities.md` の責務分担を表示

## ID Policy

MVPでは `professionalId` を必須IDとして新設しません。

- `workspaceId`: `wks_...` 形式。Customer / Reservation / Payment / Public Site / Sales / Session / Report / PostDraft / Activity / Usage の基本スコープ
- `userId`: ログインしている利用者
- `ownerUserId`: workspace の所有者
- `professionalId`: 将来拡張用

## Responsibility Policy

各アプリは `professional-platform-contracts/docs/contracts/app-responsibilities.md` の責務分担に従います。

- Growth Engine: Customer、Reservation、Stripe payment state、Sales、Public Site、Service/Menu
- Professional Studio: Session、Report、appraisal work、Report/PDF generation
- SNS Planner: PostDraft、SNS post planning
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
- `GET /api/health/numeria-studio`: Professional Studio health check
- `GET /api/health/sns-planner`: SNS Planner health check
- `GET /api/health/ai-platform-core`: AI Platform Core health check

## Database

MVP用のPostgreSQL/Supabase想定スキーマを `database/schema.sql` に置いています。

- Platform Admin は運営確認用スナップショットのみ保存
- 正本データは各Canonical Ownerが保持
- RLSは全テーブルで有効
- MVPではブラウザ直アクセス用の公開ポリシーは未開放

詳細は `docs/database.md` を参照してください。

## Operations

- `docs/operations.md`: 運用モード、Basic認証、System Status、トラブルシュート
- `docs/deployment-checklist.md`: デプロイ前チェックリスト
- `docs/vercel-deployment.md`: Vercelデプロイ手順
- `docs/ingestion-api.md`: 各アプリからのスナップショット登録API

## Environment Variables

APIは以下の環境変数がある場合、Supabase REST APIからスナップショットを読みます。
未設定の場合はMVPモックデータにフォールバックします。

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PLATFORM_ADMIN_API_TOKEN`
- `PLATFORM_ADMIN_USERNAME` optional, default: `admin`

`SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定した場合、管理画面とAPIはBasic認証を必須にします。
ユーザー名は `PLATFORM_ADMIN_USERNAME`、パスワードは `PLATFORM_ADMIN_API_TOKEN` を使います。

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
