import { NextResponse } from "next/server";
import { getAppVersion, getCommitSha, getTimestamp, readinessConfig } from "@/lib/readiness";

export async function GET() {
  return NextResponse.json(
    {
      appName: readinessConfig.appName,
      appVersion: getAppVersion(),
      contractVersion: readinessConfig.contractVersion,
      commitSha: getCommitSha(),
      timestamp: getTimestamp()
    },
    { status: 200 }
  );
}
