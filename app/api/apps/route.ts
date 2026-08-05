import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { getAppConnections } from "@/lib/snapshot-store";

export async function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const appConnections = await getAppConnections();

  return NextResponse.json({
    data: appConnections,
    count: appConnections.length
  });
}
