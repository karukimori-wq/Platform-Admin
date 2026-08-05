import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { getIntegrationLogs } from "@/lib/snapshot-store";

export async function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const appName = url.searchParams.get("appName");
  const logs = await getIntegrationLogs({ status, appName });

  return NextResponse.json({
    data: logs,
    count: logs.length
  });
}
