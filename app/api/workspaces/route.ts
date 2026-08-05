import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { getWorkspaceSummaries } from "@/lib/snapshot-store";

export async function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const workspaces = await getWorkspaceSummaries();

  return NextResponse.json({
    data: workspaces,
    count: workspaces.length
  });
}
