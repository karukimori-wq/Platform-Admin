import { NextResponse } from "next/server";
import { getD1Readiness } from "@/lib/d1";

export async function GET() {
  const readiness=await getD1Readiness();
  return NextResponse.json({status:readiness.databaseBackedPersistenceReady?"success":"warning",data:readiness,timestamp:new Date().toISOString()},{status:readiness.databaseBackedPersistenceReady?200:503});
}
