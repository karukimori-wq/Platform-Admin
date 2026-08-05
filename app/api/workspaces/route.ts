import { NextResponse } from "next/server";
import { workspaces } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({
    data: workspaces,
    count: workspaces.length
  });
}
