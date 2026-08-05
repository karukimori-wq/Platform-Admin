import { NextResponse } from "next/server";
import { integrationLogs } from "@/lib/mock-data";

export function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const appName = url.searchParams.get("appName");

  const logs = integrationLogs.filter((log) => {
    const matchesStatus = status ? log.status === status : true;
    const matchesApp = appName ? log.appName === appName : true;

    return matchesStatus && matchesApp;
  });

  return NextResponse.json({
    data: logs,
    count: logs.length
  });
}
