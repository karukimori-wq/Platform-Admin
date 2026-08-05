import { NextResponse } from "next/server";
import { appConnections } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({
    data: appConnections,
    count: appConnections.length
  });
}
