# Ingestion API

Platform Adminは、各アプリから運営確認用スナップショットを受け取れます。
正本データは受け取らず、状態確認に必要な最小情報だけを保存します。

## Authentication

Supabase Snapshot ModeではBasic認証が必須です。

- username: `PLATFORM_ADMIN_USERNAME`
- password: `PLATFORM_ADMIN_API_TOKEN`

Mock Modeではレスポンスは返しますが、永続化は行いません。
レスポンスの `persisted` が `false` になります。

## App Connection Snapshot

`POST /api/ingest/app-connection`

用途:

- アプリの接続状態
- contract version
- health check status
- last sync time

Request:

```json
{
  "appName": "Growth Engine",
  "repositoryUrl": "https://github.com/karukimori-wq/growth-engine",
  "status": "healthy",
  "contractVersion": "v1",
  "healthCheckUrl": "/api/health/growth-engine",
  "healthCheckStatus": "ok"
}
```

Response:

```json
{
  "data": {
    "id": "growth-engine",
    "persisted": true
  }
}
```

## Integration Log Snapshot

`POST /api/ingest/log`

用途:

- API連携ログ
- イベントログ
- AI実行ログ
- Stripe Webhookログ
- エラーログ

Request:

```json
{
  "workspaceId": "wks_demo_001",
  "appName": "Growth Engine",
  "type": "event",
  "status": "success",
  "message": "growth.reservation.created.v1 received",
  "payloadRef": "evt_demo_001"
}
```

Response:

```json
{
  "data": {
    "id": "generated-id",
    "persisted": true
  }
}
```

## Allowed Values

`appName`:

- `Growth Engine`
- `Professional Studio`
- `SNS Planner`
- `AI Platform Core`

`status` for app connection:

- `healthy`
- `degraded`
- `offline`

`type` for logs:

- `api`
- `event`
- `ai`
- `stripe_webhook`
- `error`

`status` for logs:

- `success`
- `warning`
- `failed`

## Boundary

送ってよいもの:

- 状態
- contract version
- health check result
- event name
- payload reference
- error summary

送らないもの:

- 顧客情報の本文
- 鑑定内容本文
- 決済実行情報の秘密値
- AI prompt / completion本文
- Stripe secret
- API key
