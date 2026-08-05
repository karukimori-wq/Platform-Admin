import { NextResponse } from "next/server";
import { contractDocuments, contractStatuses, officialEvents, responsibilities } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({
    data: {
      documents: contractDocuments,
      statuses: contractStatuses,
      officialEvents,
      responsibilities
    }
  });
}
