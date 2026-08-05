# Deployment Checklist

Platform Admin MVPをデプロイする前の確認項目です。

## 1. Contracts

- [ ] `professional-platform-contracts` のmainを最新化した
- [ ] `docs/contracts/app-responsibilities.md` を確認した
- [ ] `docs/repositories/platform-admin.md` を確認した
- [ ] `docs/contracts/identity-contract.md` を確認した
- [ ] `docs/contracts/data-ownership.md` を確認した
- [ ] `docs/contracts/api-catalog.md` を確認した
- [ ] `docs/contracts/event-catalog.md` を確認した
- [ ] 古いイベント名を使っていない

## 2. Database

- [ ] `database/schema.sql` をSupabase/PostgreSQLへ適用した
- [ ] RLSが有効になっている
- [ ] Platform Admin用の公開RLS policyを不用意に開放していない
- [ ] `database/seed.sql` または同期処理で初期データを投入した
- [ ] `workspaceId` は `wks_...` 形式になっている
- [ ] MVPで `professionalId` を必須にしていない

## 3. Environment Variables

- [ ] `.env.example` を確認した

Mock Mode:

- [ ] `SUPABASE_URL` を未設定にする、または意図的にMock Modeとして運用する
- [ ] `SUPABASE_SERVICE_ROLE_KEY` を未設定にする、または意図的にMock Modeとして運用する

Supabase Snapshot Mode:

- [ ] `SUPABASE_URL` を設定した
- [ ] `SUPABASE_SERVICE_ROLE_KEY` を設定した
- [ ] `PLATFORM_ADMIN_API_TOKEN` を設定した
- [ ] `PLATFORM_ADMIN_USERNAME` を設定した、またはdefault `admin` を使う判断をした

## 4. Security

- [ ] Supabase Snapshot ModeでBasic認証が有効になっている
- [ ] `GET /api/status` でシークレット値そのものが返らない
- [ ] ブラウザにservice role keyを露出していない
- [ ] Platform Adminは決済処理を実行しない
- [ ] Platform AdminはAI実行を行わない
- [ ] Platform Adminは業務データの正本を持たない

## 5. API Smoke Test

- [ ] `npm run smoke` を実行した
- [ ] `GET /api/status`
- [ ] `GET /api/apps`
- [ ] `GET /api/workspaces`
- [ ] `GET /api/logs`
- [ ] `GET /api/logs?status=failed`
- [ ] `GET /api/contracts`
- [ ] `GET /api/health/growth-engine`
- [ ] `GET /api/health/numeria-studio`
- [ ] `GET /api/health/sns-planner`
- [ ] `GET /api/health/ai-platform-core`

## 6. Build

- [ ] `npm install`
- [ ] `npm run typecheck`
- [ ] `npm run build`

## 7. Vercel

- [ ] `docs/vercel-deployment.md` を確認した
- [ ] Build Commandが `npm run build` になっている
- [ ] Install Commandが `npm install` になっている
- [ ] Mock Mode / Supabase Snapshot Mode のどちらで出すか決めた
- [ ] Supabase Snapshot Modeの場合、Vercelに必要な環境変数を設定した

## 8. UI

- [ ] Dashboardで管理対象4アプリが表示される
- [ ] AppsでcontractVersionが表示される
- [ ] WorkspacesでStripe接続状態が表示される
- [ ] Workspacesで公開サイト状態が表示される
- [ ] LogsでAPI/Event/AI/Stripe/Error logsが表示される
- [ ] Contractsで準拠状態、必須ドキュメント、正式イベント名が表示される
- [ ] System StatusでdataSourceとBasic Auth状態が確認できる

## 9. MVP Non-Goals

- [ ] 一般利用者向け画面を作っていない
- [ ] 占い師向け業務画面を作っていない
- [ ] 鑑定書作成機能を作っていない
- [ ] SNS投稿作成機能を作っていない
- [ ] 顧客対応機能を作っていない
- [ ] 決済実行機能を作っていない
- [ ] AI実行機能を作っていない
