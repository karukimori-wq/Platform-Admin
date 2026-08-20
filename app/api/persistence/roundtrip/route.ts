import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { d1Roundtrip } from "@/lib/d1-snapshot-store";
import { getSnapshotDriver } from "@/lib/snapshot-driver";

export async function POST(request: Request) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const driver = getSnapshotDriver();
  if (driver !== "d1") {
    return NextResponse.json(
      {
        roundtripReady: false,
        driver,
        issue: "D1 roundtrip requires SNAPSHOT_DRIVER=d1"
      },
      { status: 409 }
    );
  }

  try {
    const result = await d1Roundtrip();
    return NextResponse.json(result, { status: result.roundtripReady ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        roundtripReady: false,
        driver,
        issue: error instanceof Error ? error.message : "D1 roundtrip failed"
      },
      { status: 503 }
    );
  }
}
