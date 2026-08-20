import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { getSnapshotDriver, snapshotDriverRequiresAdminAccess } from "@/lib/snapshot-driver";
import type { SystemStatus } from "@/lib/types";

export function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const driver = getSnapshotDriver();
  const status: SystemStatus = {
    dataSource: driver,
    basicAuth: snapshotDriverRequiresAdminAccess() ? "enabled" : "disabled",
    database: {
      supabaseUrl: process.env.SUPABASE_URL ? "configured" : "missing",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "missing",
      d1Binding: driver === "d1" ? "target" : "inactive"
    },
    admin: {
      username: process.env.PLATFORM_ADMIN_USERNAME ?? "admin",
      apiToken: process.env.PLATFORM_ADMIN_API_TOKEN ? "configured" : "missing",
      clerk:
        process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          ? "configured"
          : "missing"
    }
  };

  return NextResponse.json({ data: status });
}
