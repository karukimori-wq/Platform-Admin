# Platform Admin Operations

Platform Admin は運営者専用の監視・確認アプリです。
業務データの正本は持たず、各アプリから同期された運営確認用スナップショットだけを扱います。

## Operating Modes

### Mock Mode

環境変数 `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が未設定の場合、APIは `lib/mock-data.ts` のMVPデータを返します。

用途:

- UI確認
- APIレスポンス確認
- contracts責務分担の表示確認
- 初期デモ

### Supabase Snapshot Mode

`SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定した場合、APIはSupabase REST APIからスナップショットを読みます。

このモードでは管理画面とAPI全体にBasic認証が必須になります。

必要な環境変数:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PLATFORM_ADMIN_API_TOKEN`
- `PLATFORM_ADMIN_USERNAME` optional, default: `admin`

設定例は `.env.example` を参照してください。

Basic認証:

- username: `PLATFORM_ADMIN_USERNAME`
- password: `PLATFORM_ADMIN_API_TOKEN`

## System Status

DashboardのSystem Status、または `GET /api/status` で以下を確認できます。

- `dataSource`: `mock` or `supabase`
- `basicAuth`: `enabled` or `disabled`
- `database.supabaseUrl`: configured/missing
- `database.serviceRoleKey`: configured/missing
- `admin.apiToken`: configured/missing

シークレット値そのものは返しません。

## Data Ownership Rules

Platform Admin が保存・表示してよいもの:

- AppConnection
- WorkspaceSummary
- IntegrationLog
- ContractStatus
- contract document snapshot
- official event snapshot
- responsibility snapshot

Platform Admin が正本として持たないもの:

- Customer
- Reservation
- Payment
- Sales
- Public Site
- Session
- Report
- PostDraft
- Activity execution payload
- AI実行本体

各データの正本は `professional-platform-contracts/docs/contracts/app-responsibilities.md` に従います。

## Troubleshooting

### APIの疎通確認をしたい

ローカルまたはデプロイ先に対して主要APIの疎通を確認できます。
ローカル確認では、先に `npm run dev` または `npm run start` でPlatform Adminを起動してください。

```bash
npm run smoke
```

デプロイ先を確認する場合:

```bash
PLATFORM_ADMIN_BASE_URL=https://your-platform-admin.example.com npm run smoke
```

Supabase Snapshot ModeでBasic認証が必要な場合は、`PLATFORM_ADMIN_USERNAME` と `PLATFORM_ADMIN_API_TOKEN` を設定して実行します。

### Dashboardが空に見える

1. `GET /api/status` を確認
2. `dataSource` が `mock` か `supabase` か確認
3. Supabase modeの場合、Basic認証のusername/passwordを確認
4. Supabase tableにseedまたは同期データがあるか確認

### 401が返る

Supabase Snapshot ModeではBasic認証が必須です。

確認項目:

- `PLATFORM_ADMIN_API_TOKEN` が設定されている
- `PLATFORM_ADMIN_USERNAME` が設定値、またはdefaultの `admin` と一致している
- ブラウザまたはAPIクライアントでBasic認証を送っている

### Supabaseの値が表示されない

確認項目:

- `SUPABASE_URL` が正しい
- `SUPABASE_SERVICE_ROLE_KEY` が正しい
- `database/schema.sql` が適用済み
- `database/seed.sql` または同期処理でデータ投入済み

### Contractsが不整合に見える

確認項目:

- `professional-platform-contracts` のmainを最新化
- `docs/contracts/app-responsibilities.md`
- `docs/contracts/identity-contract.md`
- `docs/contracts/data-ownership.md`
- `docs/contracts/api-catalog.md`
- `docs/contracts/event-catalog.md`
