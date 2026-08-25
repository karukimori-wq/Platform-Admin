import { appConnections, contractDocuments, contractStatuses, integrationLogs, officialEvents, responsibilities, workspaces } from "@/lib/mock-data";
import { getD1Database } from "@/lib/d1";
import type { AppConnection, AppName, AppStatus, ContractStatusValue, IntegrationLog, LogStatus, Responsibility, WorkspaceSummary } from "@/lib/types";

type DbAppConnection = { id:string; app_name:AppName; repository_url:string; status:AppStatus; contract_version:string; last_sync_at:string|null; health_check_url:string|null; health_check_status:string|null; created_at:string; updated_at:string };
type DbWorkspaceSummary = { workspace_id:string; owner_user_id:string; plan:WorkspaceSummary["plan"]; stripe_status:WorkspaceSummary["stripeStatus"]; public_site_status:WorkspaceSummary["publicSiteStatus"]; enabled_apps?:AppName[]; enabled_apps_json?:string; created_at:string; updated_at:string };
type DbIntegrationLog = { id:string; workspace_id:string; app_name:AppName; type:IntegrationLog["type"]; status:LogStatus; message:string; payload_ref:string|null; created_at:string };
type DbContractStatus = { id:string; app_name:AppName; required_contract_version:string; current_contract_version:string; status:ContractStatusValue; issues?:string[]; issues_json?:string; checked_at:string };
type DbContractDocument = { path:string };
type DbOfficialEvent = { event_name:string };
type DbResponsibility = { area:string; canonical_owner:Responsibility["canonicalOwner"] };

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabaseConfig = () => Boolean(supabaseUrl && serviceRoleKey);

function parseJsonArray<T>(value:string|undefined):T[] {
  if (!value) return [];
  try {
    const parsed:unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

async function readSupabase<T>(table:string, query="select=*"):Promise<T[]> {
  if (!hasSupabaseConfig()) return [];
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: { apikey: serviceRoleKey as string, authorization: `Bearer ${serviceRoleKey}`, "content-type":"application/json" },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Failed to read ${table}: ${response.status}`);
  return response.json();
}

async function upsertSupabase<T>(table:string, payload:T) {
  if (!hasSupabaseConfig()) return { persisted:false, driver:"mock" as const };
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method:"POST",
    headers: { apikey:serviceRoleKey as string, authorization:`Bearer ${serviceRoleKey}`, "content-type":"application/json", prefer:"resolution=merge-duplicates,return=minimal" },
    body:JSON.stringify(payload),
    cache:"no-store"
  });
  if (!response.ok) throw new Error(`Failed to upsert ${table}: ${response.status}`);
  return { persisted:true, driver:"supabase" as const };
}

async function readRows<T>(table:string, sql:string, query="select=*"):Promise<T[]> {
  const db = await getD1Database();
  if (db) return (await db.prepare(sql).all<T>()).results;
  return readSupabase<T>(table, query);
}

const mapApp = (row:DbAppConnection):AppConnection => ({
  id:row.id, appName:row.app_name, repositoryUrl:row.repository_url, status:row.status,
  contractVersion:row.contract_version, lastSyncAt:row.last_sync_at ?? "", healthCheckUrl:row.health_check_url ?? "",
  healthCheckStatus:row.health_check_status ?? "", createdAt:row.created_at, updatedAt:row.updated_at
});

export async function getAppConnections() {
  const rows = await readRows<DbAppConnection>("app_connections", "SELECT * FROM app_connections ORDER BY app_name", "select=*&order=app_name.asc");
  return rows.length ? rows.map(mapApp) : appConnections;
}

export async function getWorkspaceSummaries() {
  const rows = await readRows<DbWorkspaceSummary>("workspace_summaries", "SELECT * FROM workspace_summaries ORDER BY workspace_id", "select=*&order=workspace_id.asc");
  return rows.length ? rows.map((row) => ({
    workspaceId:row.workspace_id, ownerUserId:row.owner_user_id, plan:row.plan, stripeStatus:row.stripe_status,
    publicSiteStatus:row.public_site_status, enabledApps:row.enabled_apps ?? parseJsonArray<AppName>(row.enabled_apps_json),
    createdAt:row.created_at, updatedAt:row.updated_at
  })) : workspaces;
}

export async function getIntegrationLogs(filters?:{status?:string|null; appName?:string|null}) {
  const db = await getD1Database();
  let rows:DbIntegrationLog[] = [];
  if (db) {
    const clauses:string[] = [];
    const values:unknown[] = [];
    if (filters?.status) { clauses.push("status=?"); values.push(filters.status); }
    if (filters?.appName) { clauses.push("app_name=?"); values.push(filters.appName); }
    const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    rows = (await db.prepare(`SELECT * FROM integration_logs${where} ORDER BY created_at DESC`).bind(...values).all<DbIntegrationLog>()).results;
  } else {
    const conditions = ["select=*", "order=created_at.desc"];
    if (filters?.status) conditions.push(`status=eq.${encodeURIComponent(filters.status)}`);
    if (filters?.appName) conditions.push(`app_name=eq.${encodeURIComponent(filters.appName)}`);
    rows = await readSupabase<DbIntegrationLog>("integration_logs", conditions.join("&"));
  }
  const fallback = integrationLogs.filter((log) => (filters?.status ? log.status === filters.status : true) && (filters?.appName ? log.appName === filters.appName : true));
  return rows.length ? rows.map((row) => ({ id:row.id, workspaceId:row.workspace_id, appName:row.app_name, type:row.type, status:row.status, message:row.message, payloadRef:row.payload_ref ?? "", createdAt:row.created_at })) : fallback;
}

export async function getContractSnapshot() {
  const db = await getD1Database();
  let statusRows:DbContractStatus[];
  let documentRows:DbContractDocument[];
  let eventRows:DbOfficialEvent[];
  let responsibilityRows:DbResponsibility[];
  if (db) {
    [statusRows, documentRows, eventRows, responsibilityRows] = await Promise.all([
      db.prepare("SELECT * FROM contract_statuses ORDER BY app_name").all<DbContractStatus>().then((r) => r.results),
      db.prepare("SELECT path FROM contract_documents ORDER BY path").all<DbContractDocument>().then((r) => r.results),
      db.prepare("SELECT event_name FROM official_events ORDER BY event_name").all<DbOfficialEvent>().then((r) => r.results),
      db.prepare("SELECT area,canonical_owner FROM responsibility_snapshots ORDER BY area").all<DbResponsibility>().then((r) => r.results)
    ]);
  } else {
    [statusRows, documentRows, eventRows, responsibilityRows] = await Promise.all([
      readSupabase<DbContractStatus>("contract_statuses", "select=*&order=app_name.asc"),
      readSupabase<DbContractDocument>("contract_documents", "select=path&order=path.asc"),
      readSupabase<DbOfficialEvent>("official_events", "select=event_name&order=event_name.asc"),
      readSupabase<DbResponsibility>("responsibility_snapshots", "select=*&order=area.asc")
    ]);
  }
  return {
    documents:documentRows.length ? documentRows.map((row) => row.path) : contractDocuments,
    statuses:statusRows.length ? statusRows.map((row) => ({ id:row.id, appName:row.app_name, requiredContractVersion:row.required_contract_version, currentContractVersion:row.current_contract_version, status:row.status, issues:row.issues ?? parseJsonArray<string>(row.issues_json), checkedAt:row.checked_at })) : contractStatuses,
    officialEvents:eventRows.length ? eventRows.map((row) => row.event_name) : officialEvents,
    responsibilities:responsibilityRows.length ? responsibilityRows.map((row) => ({ area:row.area, canonicalOwner:row.canonical_owner })) : responsibilities
  };
}

export async function upsertAppConnectionSnapshot(app:AppConnection) {
  const db = await getD1Database();
  if (db) {
    await db.prepare("INSERT INTO app_connections(id,app_name,repository_url,status,contract_version,last_sync_at,health_check_url,health_check_status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET app_name=excluded.app_name,repository_url=excluded.repository_url,status=excluded.status,contract_version=excluded.contract_version,last_sync_at=excluded.last_sync_at,health_check_url=excluded.health_check_url,health_check_status=excluded.health_check_status,updated_at=excluded.updated_at").bind(app.id,app.appName,app.repositoryUrl,app.status,app.contractVersion,app.lastSyncAt||null,app.healthCheckUrl||null,app.healthCheckStatus||null,app.createdAt,app.updatedAt).run();
    return { persisted:true, driver:"d1" as const };
  }
  return upsertSupabase("app_connections", { id:app.id, app_name:app.appName, repository_url:app.repositoryUrl, status:app.status, contract_version:app.contractVersion, last_sync_at:app.lastSyncAt||null, health_check_url:app.healthCheckUrl||null, health_check_status:app.healthCheckStatus||null, created_at:app.createdAt, updated_at:app.updatedAt });
}

export async function createIntegrationLogSnapshot(log:IntegrationLog) {
  const db = await getD1Database();
  if (db) {
    await db.prepare("INSERT INTO integration_logs(id,workspace_id,app_name,type,status,message,payload_ref,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,message=excluded.message,payload_ref=excluded.payload_ref").bind(log.id,log.workspaceId,log.appName,log.type,log.status,log.message,log.payloadRef||null,log.createdAt).run();
    return { persisted:true, driver:"d1" as const };
  }
  return upsertSupabase("integration_logs", { id:log.id, workspace_id:log.workspaceId, app_name:log.appName, type:log.type, status:log.status, message:log.message, payload_ref:log.payloadRef||null, created_at:log.createdAt });
}
