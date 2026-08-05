import {
  appConnections,
  contractDocuments,
  contractStatuses,
  integrationLogs,
  officialEvents,
  responsibilities,
  workspaces
} from "@/lib/mock-data";
import type {
  AppConnection,
  AppName,
  AppStatus,
  ContractStatusValue,
  IntegrationLog,
  LogStatus,
  Responsibility,
  WorkspaceSummary
} from "@/lib/types";

type DbAppConnection = {
  id: string;
  app_name: AppName;
  repository_url: string;
  status: AppStatus;
  contract_version: string;
  last_sync_at: string | null;
  health_check_url: string | null;
  health_check_status: string | null;
  created_at: string;
  updated_at: string;
};

type DbWorkspaceSummary = {
  workspace_id: string;
  owner_user_id: string;
  plan: WorkspaceSummary["plan"];
  stripe_status: WorkspaceSummary["stripeStatus"];
  public_site_status: WorkspaceSummary["publicSiteStatus"];
  enabled_apps: AppName[];
  created_at: string;
  updated_at: string;
};

type DbIntegrationLog = {
  id: string;
  workspace_id: string;
  app_name: AppName;
  type: IntegrationLog["type"];
  status: LogStatus;
  message: string;
  payload_ref: string | null;
  created_at: string;
};

type DbContractStatus = {
  id: string;
  app_name: AppName;
  required_contract_version: string;
  current_contract_version: string;
  status: ContractStatusValue;
  issues: string[];
  checked_at: string;
};

type DbContractDocument = {
  path: string;
};

type DbOfficialEvent = {
  event_name: string;
};

type DbResponsibility = {
  area: string;
  canonical_owner: Responsibility["canonicalOwner"];
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hasDatabaseConfig() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

async function readTable<T>(table: string, query = "select=*"): Promise<T[]> {
  if (!hasDatabaseConfig()) return [];

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: serviceRoleKey as string,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to read ${table}: ${response.status}`);
  }

  return response.json();
}

async function upsertTable<TPayload>(table: string, payload: TPayload) {
  if (!hasDatabaseConfig()) {
    return { persisted: false };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey as string,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to upsert ${table}: ${response.status}`);
  }

  return { persisted: true };
}

export async function getAppConnections(): Promise<AppConnection[]> {
  const rows = await readTable<DbAppConnection>("app_connections", "select=*&order=app_name.asc");

  if (!rows.length) return appConnections;

  return rows.map((row) => ({
    id: row.id,
    appName: row.app_name,
    repositoryUrl: row.repository_url,
    status: row.status,
    contractVersion: row.contract_version,
    lastSyncAt: row.last_sync_at ?? "",
    healthCheckUrl: row.health_check_url ?? "",
    healthCheckStatus: row.health_check_status ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getWorkspaceSummaries(): Promise<WorkspaceSummary[]> {
  const rows = await readTable<DbWorkspaceSummary>("workspace_summaries", "select=*&order=workspace_id.asc");

  if (!rows.length) return workspaces;

  return rows.map((row) => ({
    workspaceId: row.workspace_id,
    ownerUserId: row.owner_user_id,
    plan: row.plan,
    stripeStatus: row.stripe_status,
    publicSiteStatus: row.public_site_status,
    enabledApps: row.enabled_apps,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getIntegrationLogs(filters?: {
  status?: string | null;
  appName?: string | null;
}): Promise<IntegrationLog[]> {
  const conditions = ["select=*", "order=created_at.desc"];

  if (filters?.status) conditions.push(`status=eq.${encodeURIComponent(filters.status)}`);
  if (filters?.appName) conditions.push(`app_name=eq.${encodeURIComponent(filters.appName)}`);

  const rows = await readTable<DbIntegrationLog>("integration_logs", conditions.join("&"));

  const fallbackLogs = integrationLogs.filter((log) => {
    const matchesStatus = filters?.status ? log.status === filters.status : true;
    const matchesApp = filters?.appName ? log.appName === filters.appName : true;

    return matchesStatus && matchesApp;
  });

  if (!rows.length) return fallbackLogs;

  return rows.map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    appName: row.app_name,
    type: row.type,
    status: row.status,
    message: row.message,
    payloadRef: row.payload_ref ?? "",
    createdAt: row.created_at
  }));
}

export async function getContractSnapshot() {
  const [statusRows, documentRows, eventRows, responsibilityRows] = await Promise.all([
    readTable<DbContractStatus>("contract_statuses", "select=*&order=app_name.asc"),
    readTable<DbContractDocument>("contract_documents", "select=path&order=path.asc"),
    readTable<DbOfficialEvent>("official_events", "select=event_name&order=event_name.asc"),
    readTable<DbResponsibility>("responsibility_snapshots", "select=*&order=area.asc")
  ]);

  return {
    documents: documentRows.length ? documentRows.map((row) => row.path) : contractDocuments,
    statuses: statusRows.length
      ? statusRows.map((row) => ({
          id: row.id,
          appName: row.app_name,
          requiredContractVersion: row.required_contract_version,
          currentContractVersion: row.current_contract_version,
          status: row.status,
          issues: row.issues,
          checkedAt: row.checked_at
        }))
      : contractStatuses,
    officialEvents: eventRows.length ? eventRows.map((row) => row.event_name) : officialEvents,
    responsibilities: responsibilityRows.length
      ? responsibilityRows.map((row) => ({
          area: row.area,
          canonicalOwner: row.canonical_owner
        }))
      : responsibilities
  };
}

export async function upsertAppConnectionSnapshot(app: AppConnection) {
  return upsertTable("app_connections", {
    id: app.id,
    app_name: app.appName,
    repository_url: app.repositoryUrl,
    status: app.status,
    contract_version: app.contractVersion,
    last_sync_at: app.lastSyncAt || null,
    health_check_url: app.healthCheckUrl || null,
    health_check_status: app.healthCheckStatus || null,
    created_at: app.createdAt,
    updated_at: app.updatedAt
  });
}

export async function createIntegrationLogSnapshot(log: IntegrationLog) {
  return upsertTable("integration_logs", {
    id: log.id,
    workspace_id: log.workspaceId,
    app_name: log.appName,
    type: log.type,
    status: log.status,
    message: log.message,
    payload_ref: log.payloadRef || null,
    created_at: log.createdAt
  });
}
