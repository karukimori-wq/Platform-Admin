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

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```
