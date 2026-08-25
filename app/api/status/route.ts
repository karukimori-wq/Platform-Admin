import { NextResponse } from "next/server";
import { assertAdminApiAccess, databaseReadsRequireAdminToken } from "@/lib/admin-auth";
import { getD1Readiness } from "@/lib/d1";
import type { SystemStatus } from "@/lib/types";

export async function GET(request: Request) {
  const unauthorized=assertAdminApiAccess(request);if(unauthorized)return unauthorized;
  const protectedReads=databaseReadsRequireAdminToken(),d1=process.env.PLATFORM_ADMIN_PERSISTENCE_DRIVER==="d1"?await getD1Readiness():null;
  const status:SystemStatus={dataSource:d1?.databaseBackedPersistenceReady?"d1":process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY?"supabase":"mock",basicAuth:protectedReads?"enabled":"disabled",database:{supabaseUrl:process.env.SUPABASE_URL?"configured":"missing",serviceRoleKey:process.env.SUPABASE_SERVICE_ROLE_KEY?"configured":"missing",d1:d1?.d1Configured?"configured":"missing"},admin:{username:process.env.PLATFORM_ADMIN_USERNAME??"admin",apiToken:process.env.PLATFORM_ADMIN_API_TOKEN?"configured":"missing"}};
  return NextResponse.json({data:status,persistence:d1});
}
