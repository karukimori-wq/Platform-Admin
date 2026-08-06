import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const databaseReadsEnabled = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!databaseReadsEnabled) return NextResponse.next();

  const configuredToken = process.env.PLATFORM_ADMIN_API_TOKEN;
  const configuredUsername = process.env.PLATFORM_ADMIN_USERNAME ?? "admin";
  const credentials = parseBasicAuth(request.headers.get("authorization"));

  if (!configuredToken || credentials.username !== configuredUsername || credentials.password !== configuredToken) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "www-authenticate": "Basic realm=\"Platform Admin\""
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|health|version|contracts/status).*)"]
};

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) return { username: "", password: "" };

  try {
    const decoded = atob(header.slice("Basic ".length));
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
