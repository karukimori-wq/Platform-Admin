import { NextResponse } from "next/server";
import { snapshotDriverRequiresAdminAccess } from "@/lib/snapshot-driver";

export function databaseReadsRequireAdminToken() {
  return snapshotDriverRequiresAdminAccess();
}

export function assertAdminApiAccess(request: Request) {
  if (!snapshotDriverRequiresAdminAccess()) return null;

  // Transitional fallback. Clerk becomes the primary user-facing admin auth
  // once a Clerk application and production keys are configured. This token
  // remains useful for service/API access during the reversible migration.
  const configuredToken = process.env.PLATFORM_ADMIN_API_TOKEN;
  const requestToken = parseBasicAuth(request.headers.get("authorization")).password;

  if (!configuredToken || requestToken !== configuredToken) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Platform Admin authorization is required for persistent snapshot access"
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
