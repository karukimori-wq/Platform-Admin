import { NextResponse } from "next/server";

export function databaseReadsRequireAdminToken() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function assertAdminApiAccess(request: Request) {
  if (!databaseReadsRequireAdminToken()) return null;

  const configuredToken = process.env.PLATFORM_ADMIN_API_TOKEN;
  const requestToken = parseBasicAuth(request.headers.get("authorization")).password;

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

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) return { username: "", password: "" };

  try {
    const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) return { username: decoded, password: "" };

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return { username: "", password: "" };
  }
}
