import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { createIntegrationLogSnapshot } from "@/lib/snapshot-store";
import type { AppName, IntegrationLog, LogStatus } from "@/lib/types";

const appNames: AppName[] = ["Platform Admin", "Growth Engine", "Professional Studio", "SNS Planner", "AI Platform Core"];
const logStatuses: LogStatus[] = ["success", "warning", "failed"];
const logTypes: IntegrationLog["type"][] = ["api", "event", "ai", "stripe_webhook", "error"];
type JsonObject = Record<string, unknown>;

export async function POST(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const rawPayload: unknown = await request.json();
  if (!isJsonObject(rawPayload)) {
    return NextResponse.json({ error: "Invalid payload", message: "JSON object is required" }, { status: 400 });
  }
  const payload = rawPayload;
  const now = new Date().toISOString();

  if (!isWorkspaceId(payload.workspaceId) || !isAppName(payload.appName) || !isLogType(payload.type) || !isLogStatus(payload.status)) {
    return NextResponse.json(
      { error: "Invalid payload", message: "workspaceId, appName, type, and status are required" },
      { status: 400 }
    );
  }

  const snapshot: IntegrationLog = {
    id: String(payload.id ?? crypto.randomUUID()),
    workspaceId: payload.workspaceId,
    appName: payload.appName,
    type: payload.type,
    status: payload.status,
    message: String(payload.message ?? ""),
    payloadRef: String(payload.payloadRef ?? ""),
    createdAt: String(payload.createdAt ?? now)
  };

  const result = await createIntegrationLogSnapshot(snapshot);
  return NextResponse.json({ data: { id: snapshot.id, persisted: result.persisted } });
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isWorkspaceId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("wks_");
}
function isAppName(value: unknown): value is AppName {
  return typeof value === "string" && appNames.includes(value as AppName);
}
function isLogType(value: unknown): value is IntegrationLog["type"] {
  return typeof value === "string" && logTypes.includes(value as IntegrationLog["type"]);
}
function isLogStatus(value: unknown): value is LogStatus {
  return typeof value === "string" && logStatuses.includes(value as LogStatus);
}
