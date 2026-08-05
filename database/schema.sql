-- Platform Admin MVP schema
-- This schema stores operational snapshots only.
-- Canonical business data remains owned by the responsible product apps.

create table if not exists app_connections (
  id text primary key,
  app_name text not null,
  repository_url text not null,
  status text not null check (status in ('healthy', 'degraded', 'offline')),
  contract_version text not null,
  last_sync_at timestamptz,
  health_check_url text,
  health_check_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspace_summaries (
  workspace_id text primary key check (workspace_id like 'wks_%'),
  owner_user_id text not null,
  plan text not null check (plan in ('Free', 'Business', 'Pro')),
  stripe_status text not null check (stripe_status in ('connected', 'pending', 'error')),
  public_site_status text not null check (public_site_status in ('published', 'draft', 'disabled')),
  enabled_apps text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integration_logs (
  id text primary key,
  workspace_id text not null check (workspace_id like 'wks_%'),
  app_name text not null,
  type text not null check (type in ('api', 'event', 'ai', 'stripe_webhook', 'error')),
  status text not null check (status in ('success', 'warning', 'failed')),
  message text not null,
  payload_ref text,
  created_at timestamptz not null default now()
);

create table if not exists contract_statuses (
  id text primary key,
  app_name text not null,
  required_contract_version text not null,
  current_contract_version text not null,
  status text not null check (status in ('compliant', 'warning', 'mismatch')),
  issues jsonb not null default '[]'::jsonb,
  checked_at timestamptz not null default now()
);

create table if not exists contract_documents (
  path text primary key,
  required boolean not null default true,
  checked_at timestamptz not null default now()
);

create table if not exists official_events (
  event_name text primary key,
  publisher_app text not null,
  status text not null check (status in ('approved', 'pending')) default 'approved',
  checked_at timestamptz not null default now()
);

create table if not exists responsibility_snapshots (
  area text primary key,
  canonical_owner text not null,
  checked_at timestamptz not null default now()
);

create index if not exists integration_logs_workspace_id_idx on integration_logs (workspace_id);
create index if not exists integration_logs_app_name_idx on integration_logs (app_name);
create index if not exists integration_logs_status_idx on integration_logs (status);
create index if not exists integration_logs_created_at_idx on integration_logs (created_at desc);
create index if not exists contract_statuses_status_idx on contract_statuses (status);

alter table app_connections enable row level security;
alter table workspace_summaries enable row level security;
alter table integration_logs enable row level security;
alter table contract_statuses enable row level security;
alter table contract_documents enable row level security;
alter table official_events enable row level security;
alter table responsibility_snapshots enable row level security;

-- MVP note:
-- Policies are intentionally not opened here.
-- Platform Admin is operator-only, so production access should be granted through
-- service-role/server-side code or a future explicit operator role policy.
