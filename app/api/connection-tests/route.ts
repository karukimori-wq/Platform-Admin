import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { runConnectionTests } from "@/lib/connection-test";

export async function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const result = await runConnectionTests();

  return NextResponse.json({
    data: result.results,
    logs: result.logs,
    count: result.results.length,
    checkedAt: result.checkedAt
  });
}
