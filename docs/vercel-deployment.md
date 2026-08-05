# Vercel Deployment

Platform Admin MVPをVercelへデプロイする手順です。

## 1. Deploy Modes

### Mock Mode

まず画面とAPIだけ確認する場合は、Supabase系の環境変数を設定しません。

この場合:

- APIは `lib/mock-data.ts` を返す
- Basic認証は無効
- DashboardのSystem Statusは `dataSource: mock` になる

### Supabase Snapshot Mode

Supabaseのスナップショットを読む場合は、以下をVercelのEnvironment Variablesへ設定します。

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PLATFORM_ADMIN_API_TOKEN`
- `PLATFORM_ADMIN_USERNAME` optional, default: `admin`

この場合:

- APIはSupabase REST APIを読む
- 管理画面とAPIはBasic認証必須
- DashboardのSystem Statusは `dataSource: supabase` になる

## 2. Vercel Project Settings

推奨設定:

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: default

## 3. Environment Variables

Mock Modeでは未設定で開始できます。
Supabase Snapshot Modeへ切り替えるときだけ `.env.example` を参考に設定してください。

注意:

- `SUPABASE_SERVICE_ROLE_KEY` はブラウザへ露出しない
- `PLATFORM_ADMIN_API_TOKEN` はBasic認証のpasswordとして使う
- `PLATFORM_ADMIN_USERNAME` 未設定時は `admin`

## 4. After Deploy

デプロイ後、以下を確認します。

1. 管理画面へアクセス
2. System Statusを確認
3. `dataSource` が想定通りか確認
4. Supabase Snapshot Modeの場合、Basic認証が出ることを確認
5. Dashboard / Apps / Workspaces / Logs / Contracts を確認

## 5. Smoke Test

ローカルからデプロイ先を確認できます。

```bash
PLATFORM_ADMIN_BASE_URL=https://your-platform-admin.vercel.app npm run smoke
```

Supabase Snapshot Modeの場合:

```bash
PLATFORM_ADMIN_BASE_URL=https://your-platform-admin.vercel.app \
PLATFORM_ADMIN_USERNAME=admin \
PLATFORM_ADMIN_API_TOKEN=your-token \
npm run smoke
```

## 6. Rollback

問題が出た場合は、VercelのDeploymentsから直前の成功デプロイへ戻します。

切り分け順:

1. Vercel Environment Variables
2. Dashboard System Status
3. `GET /api/status`
4. Supabase table data
5. `database/schema.sql` / `database/seed.sql`

## 7. Production Notes

MVPではBasic認証で管理画面を保護します。
本格運用で複数管理者や権限分離が必要になった場合は、NextAuth/Auth.js等の認証基盤へ移行します。

Platform Adminは運営確認用アプリであり、決済処理・AI実行・業務データ作成は行いません。
