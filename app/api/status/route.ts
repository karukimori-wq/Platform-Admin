import { NextResponse } from "next/server";
import { assertAdminApiAccess, databaseReadsRequireAdminToken } from "@/lib/admin-auth";
import type { SystemStatus } from "@/lib/types";

export function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const databaseReadsEnabled = databaseReadsRequireAdminToken();
  const status: SystemStatus = {
    dataSource: databaseReadsEnabled ? "supabase" : "mock",
    basicAuth: databaseReadsEnabled ? "enabled" : "disabled",
    database: {
      supabaseUrl: process.env.SUPABASE_URL ? "configured" : "missing",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "missing"
    },
    admin: {
      username: process.env.PLATFORM_ADMIN_USERNAME ?? "admin",
      apiToken: process.env.PLATFORM_ADMIN_API_TOKEN ? "configured" : "missing"
    }
  };

  return NextResponse.json({ data: status });
}
