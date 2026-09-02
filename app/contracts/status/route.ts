import { NextResponse } from "next/server";
import { getTimestamp, readinessConfig } from "@/lib/readiness";

export async function GET() {
  const status = readinessConfig.issues.length > 0 ? "warning" : "ok";

  return NextResponse.json(
    {
      appName: readinessConfig.appName,
      status,
      contractVersion: readinessConfig.contractVersion,
      identityMode: readinessConfig.identityMode,
      professionalIdRequired: readinessConfig.professionalIdRequired,
      usesLegacyEventNames: readinessConfig.usesLegacyEventNames,
      usesReportTerminology: readinessConfig.usesReportTerminology,
      canonicalOwnershipChecked: readinessConfig.canonicalOwnershipChecked,
      planReleaseMonitoring: readinessConfig.planReleaseMonitoring,
      issues: readinessConfig.issues,
      timestamp: getTimestamp()
    },
    { status: 200 }
  );
}