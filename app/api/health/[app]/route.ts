import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-auth";
import { getAppConnections } from "@/lib/snapshot-store";

type Params = {
  params: Promise<{
    app: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const unauthorized = assertAdminApiAccess(_request);
  if (unauthorized) return unauthorized;

  const { app } = await params;
  const appConnections = await getAppConnections();
  const connection = appConnections.find((item) => toAppSlug(item.appName) === app);

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

function toAppSlug(appName: string) {
  if (appName === "Professional Studio") return "numeria-studio";
  return appName.toLowerCase().replaceAll(" ", "-");
}
