import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { upsertAppConnectionSnapshot } from "@/lib/snapshot-store";
import type { AppConnection, AppName, AppStatus } from "@/lib/types";

const appNames: AppName[] = ["Growth Engine", "Professional Studio", "SNS Planner", "AI Platform Core"];
const appStatuses: AppStatus[] = ["healthy", "degraded", "offline"];

export async function POST(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const payload = await request.json();
  const now = new Date().toISOString();

  if (!isAppName(payload.appName) || !isAppStatus(payload.status)) {
    return NextResponse.json(
      { error: "Invalid payload", message: "appName and status are required" },
      { status: 400 }
    );
  }

  const snapshot: AppConnection = {
    id: String(payload.id ?? toAppConnectionId(payload.appName)),
    appName: payload.appName,
    repositoryUrl: String(payload.repositoryUrl ?? ""),
    status: payload.status,
    contractVersion: String(payload.contractVersion ?? ""),
    lastSyncAt: String(payload.lastSyncAt ?? now),
    healthCheckUrl: String(payload.healthCheckUrl ?? ""),
    healthCheckStatus: String(payload.healthCheckStatus ?? payload.status),
    createdAt: String(payload.createdAt ?? now),
    updatedAt: now
  };

  const result = await upsertAppConnectionSnapshot(snapshot);

  return NextResponse.json({
    data: {
      id: snapshot.id,
      persisted: result.persisted
    }
  });
}

function isAppName(value: unknown): value is AppName {
  return typeof value === "string" && appNames.includes(value as AppName);
}

function isAppStatus(value: unknown): value is AppStatus {
  return typeof value === "string" && appStatuses.includes(value as AppStatus);
}

function toAppConnectionId(appName: AppName) {
  return appName.toLowerCase().replaceAll(" ", "-");
}
