-- Platform Admin Cloudflare D1 schema
-- Operational snapshots only. Canonical business data remains in product apps.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_connections (
  id TEXT PRIMARY KEY,
  app_name TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy','degraded','offline')),
  contract_version TEXT NOT NULL,
  last_sync_at TEXT,
  health_check_url TEXT,
  health_check_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS workspace_summaries (
  workspace_id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('Free','Business','Pro')),
  stripe_status TEXT NOT NULL CHECK (stripe_status IN ('connected','pending','error')),
  public_site_status TEXT NOT NULL CHECK (public_site_status IN ('published','draft','disabled')),
  enabled_apps_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS integration_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('api','event','ai','stripe_webhook','error')),
  status TEXT NOT NULL CHECK (status IN ('success','warning','failed')),
  message TEXT NOT NULL,
  payload_ref TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contract_statuses (
  id TEXT PRIMARY KEY,
  app_name TEXT NOT NULL,
  required_contract_version TEXT NOT NULL,
  current_contract_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('compliant','warning','mismatch')),
  issues_json TEXT NOT NULL DEFAULT '[]',
  checked_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contract_documents (path TEXT PRIMARY KEY, required INTEGER NOT NULL DEFAULT 1, checked_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS official_events (event_name TEXT PRIMARY KEY, publisher_app TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'approved', checked_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS responsibility_snapshots (area TEXT PRIMARY KEY, canonical_owner TEXT NOT NULL, checked_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS integration_logs_workspace_id_idx ON integration_logs(workspace_id);
CREATE INDEX IF NOT EXISTS integration_logs_app_name_idx ON integration_logs(app_name);
CREATE INDEX IF NOT EXISTS integration_logs_status_idx ON integration_logs(status);
CREATE INDEX IF NOT EXISTS integration_logs_created_at_idx ON integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS contract_statuses_status_idx ON contract_statuses(status);
