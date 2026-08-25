import { NextResponse } from "next/server";

export function databaseReadsRequireAdminToken() {
  return process.env.PLATFORM_ADMIN_PERSISTENCE_DRIVER === "d1" || Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function assertAdminApiAccess(request: Request) {
  if (!databaseReadsRequireAdminToken()) return null;
  const configuredToken = process.env.PLATFORM_ADMIN_API_TOKEN;
  const headerToken = request.headers.get("x-platform-admin-token")?.trim() ?? "";
  const basicToken = parseBasicAuth(request.headers.get("authorization")).password;
  const requestToken = headerToken || basicToken;
  if (!configuredToken || requestToken !== configuredToken) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Platform Admin API token is required when durable persistence is enabled" },
      { status: 401 }
    );
  }
  return null;
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) return { username: "", password: "" };
  try {
    const decoded = atob(header.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return { username: decoded, password: "" };
    return { username: decoded.slice(0, separatorIndex), password: decoded.slice(separatorIndex + 1) };
  } catch {
    return { username: "", password: "" };
  }
}
