import { NextResponse } from "next/server";
import { appConnections } from "@/lib/mock-data";

type Params = {
  params: Promise<{
    app: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { app } = await params;
  const connection = appConnections.find((item) => item.healthCheckUrl.endsWith(`/${app}`));

  if (!connection) {
    return NextResponse.json(
      {
        status: "unknown",
        message: "Managed app was not found"
      },
      { status: 404 }
    );
  }

  const httpStatus = connection.status === "offline" ? 503 : 200;

  return NextResponse.json(
    {
      appName: connection.appName,
      status: connection.status,
      healthCheckStatus: connection.healthCheckStatus,
      contractVersion: connection.contractVersion,
      lastSyncAt: connection.lastSyncAt
    },
    { status: httpStatus }
  );
}
