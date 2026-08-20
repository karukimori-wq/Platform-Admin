PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_snapshots (
  app_name TEXT PRIMARY KEY,
  base_url TEXT,
  status TEXT NOT NULL,
  contract_version TEXT,
  health_check_status TEXT,
  status_code INTEGER,
  error_message TEXT,
  checked_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_snapshots (
  workspace_id TEXT PRIMARY KEY,
  owner_user_id TEXT,
  stripe_connection_status TEXT,
  public_site_status TEXT,
  active_apps_json TEXT NOT NULL DEFAULT '[]',
  checked_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS integration_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  app_name TEXT NOT NULL,
  source_app TEXT,
  target_app TEXT,
  operation TEXT,
  endpoint TEXT,
  status TEXT NOT NULL,
  status_code INTEGER,
  error_code TEXT,
  error_message TEXT,
  trace_id TEXT,
  correlation_id TEXT,
  request_id TEXT,
  event_name TEXT,
  duration_ms INTEGER,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_workspace_occurred
  ON integration_logs(workspace_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_app_occurred
  ON integration_logs(app_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_status_occurred
  ON integration_logs(status, occurred_at DESC);

CREATE TABLE IF NOT EXISTS contract_snapshots (
  app_name TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  contract_version TEXT,
  identity_mode TEXT,
  professional_id_required INTEGER NOT NULL DEFAULT 0,
  uses_legacy_event_names INTEGER NOT NULL DEFAULT 0,
  uses_report_terminology INTEGER NOT NULL DEFAULT 1,
  canonical_ownership_checked INTEGER NOT NULL DEFAULT 0,
  issues_json TEXT NOT NULL DEFAULT '[]',
  checked_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
