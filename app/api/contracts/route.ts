import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { getContractSnapshot } from "@/lib/snapshot-store";

export async function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const snapshot = await getContractSnapshot();

  return NextResponse.json({
    data: snapshot
  });
}
