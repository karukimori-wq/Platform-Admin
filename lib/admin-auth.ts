import { NextResponse } from "next/server";

export function databaseReadsRequireAdminToken() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function assertAdminApiAccess(request: Request) {
  if (!databaseReadsRequireAdminToken()) return null;

  const configuredToken = process.env.PLATFORM_ADMIN_API_TOKEN;
  const requestToken = request.headers.get("x-platform-admin-token");

  if (!configuredToken || requestToken !== configuredToken) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Platform Admin API token is required when database reads are enabled"
      },
      { status: 401 }
    );
  }

  return null;
}
