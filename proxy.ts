import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/health(.*)",
  "/version(.*)",
  "/contracts/status(.*)"
]);

const isServiceApiRoute = createRouteMatcher([
  "/api/ingest(.*)",
  "/api/persistence/roundtrip(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  // Service/API routes keep the transitional API-token fallback. Their route
  // handlers perform the token check so machine-to-machine callers do not
  // need an interactive Clerk session during migration.
  if (isServiceApiRoute(request) && request.headers.get("authorization")?.startsWith("Basic ")) {
    return NextResponse.next();
  }

  const clerkConfigured = Boolean(
    process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  if (clerkConfigured) {
    await auth.protect();
    return NextResponse.next();
  }

  // Reversible migration fallback until Clerk production keys are configured.
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
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)"
  ]
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
