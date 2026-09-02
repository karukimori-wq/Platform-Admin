import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { runPlanReadinessChecks } from "@/lib/plan-readiness";

export async function GET(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const result = await runPlanReadinessChecks();

  return NextResponse.json(result);
}