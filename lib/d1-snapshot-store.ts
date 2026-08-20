import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1DatabaseLike = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<unknown>;
      all<T = unknown>(): Promise<{ results?: T[] }>;
    };
    first<T = unknown>(): Promise<T | null>;
    run(): Promise<unknown>;
    all<T = unknown>(): Promise<{ results?: T[] }>;
  };
};

function getDb(): D1DatabaseLike {
  const { env } = getCloudflareContext();
  const db = (env as unknown as { DB?: D1DatabaseLike }).DB;
  if (!db) throw new Error("D1 binding DB is not available");
  return db;
}

export async function d1ListAppSnapshots() {
  const result = await getDb()
    .prepare("SELECT * FROM app_snapshots ORDER BY app_name ASC")
    .all<Record<string, unknown>>();
  return result.results ?? [];
}

export async function d1ListWorkspaceSnapshots() {
  const result = await getDb()
    .prepare("SELECT * FROM workspace_snapshots ORDER BY workspace_id ASC")
    .all<Record<string, unknown>>();
  return result.results ?? [];
}

export async function d1ListIntegrationLogs(filters?: { status?: string | null; appName?: string | null }) {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (filters?.status) {
    conditions.push("status = ?");
    values.push(filters.status);
  }
  if (filters?.appName) {
    conditions.push("app_name = ?");
    values.push(filters.appName);
  }
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const statement = getDb().prepare(`SELECT * FROM integration_logs${where} ORDER BY occurred_at DESC`);
  const result = values.length
    ? await statement.bind(...values).all<Record<string, unknown>>()
    : await statement.all<Record<string, unknown>>();
  return result.results ?? [];
}

export async function d1UpsertAppSnapshot(input: {
  appName: string;
  baseUrl?: string;
  status: string;
  contractVersion?: string;
  healthCheckStatus?: string;
  statusCode?: number | null;
  errorMessage?: string;
  checkedAt: string;
}) {
  await getDb()
    .prepare(`INSERT INTO app_snapshots
      (app_name, base_url, status, contract_version, health_check_status, status_code, error_message, checked_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(app_name) DO UPDATE SET
        base_url=excluded.base_url,
        status=excluded.status,
        contract_version=excluded.contract_version,
        health_check_status=excluded.health_check_status,
        status_code=excluded.status_code,
        error_message=excluded.error_message,
        checked_at=excluded.checked_at,
        updated_at=excluded.updated_at`)
    .bind(
      input.appName,
      input.baseUrl ?? null,
      input.status,
      input.contractVersion ?? null,
      input.healthCheckStatus ?? null,
      input.statusCode ?? null,
      input.errorMessage ?? null,
      input.checkedAt,
      input.checkedAt
    )
    .run();
  return { persisted: true as const, driver: "d1" as const };
}

export async function d1CreateIntegrationLog(input: {
  id: string;
  workspaceId?: string;
  appName: string;
  status: string;
  message?: string;
  occurredAt: string;
}) {
  await getDb()
    .prepare(`INSERT INTO integration_logs
      (id, workspace_id, app_name, status, error_message, occurred_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        workspace_id=excluded.workspace_id,
        app_name=excluded.app_name,
        status=excluded.status,
        error_message=excluded.error_message,
        occurred_at=excluded.occurred_at`)
    .bind(
      input.id,
      input.workspaceId ?? null,
      input.appName,
      input.status,
      input.message ?? null,
      input.occurredAt,
      input.occurredAt
    )
    .run();
  return { persisted: true as const, driver: "d1" as const };
}

export async function d1Roundtrip() {
  const id = `roundtrip_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const db = getDb();
  await db
    .prepare(`INSERT INTO integration_logs
      (id, app_name, status, operation, occurred_at, created_at)
      VALUES (?, 'Platform Admin', 'success', 'persistence.roundtrip', ?, ?)`)
    .bind(id, now, now)
    .run();
  const row = await db.prepare("SELECT id, status, operation FROM integration_logs WHERE id = ?").bind(id).first<{
    id: string;
    status: string;
    operation: string;
  }>();
  await db.prepare("DELETE FROM integration_logs WHERE id = ?").bind(id).run();
  return {
    roundtripReady: row?.id === id && row.status === "success" && row.operation === "persistence.roundtrip",
    driver: "d1" as const
  };
}
