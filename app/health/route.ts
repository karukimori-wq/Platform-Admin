import { NextResponse } from "next/server";
import { getTimestamp, readinessConfig } from "@/lib/readiness";

export async function GET() {
  return NextResponse.json(
    {
      appName: readinessConfig.appName,
      status: "ok",
      timestamp: getTimestamp()
    },
    { status: 200 }
  );
}
