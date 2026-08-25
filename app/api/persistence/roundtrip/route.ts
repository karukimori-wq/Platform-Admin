import { NextResponse } from "next/server";
import { getD1Database } from "@/lib/d1";

export async function POST(request:Request){
  const expected=process.env.PLATFORM_ADMIN_API_TOKEN,provided=request.headers.get("x-platform-admin-token");
  if(!expected||provided!==expected)return NextResponse.json({status:"error",error:{code:"UNAUTHORIZED",message:"Platform Admin token required"}},{status:401});
  const db=await getD1Database();if(!db)return NextResponse.json({status:"error",data:{persistenceDriver:"d1",roundtripReady:false}},{status:503});
  const id=crypto.randomUUID(),now=new Date().toISOString();
  try{await db.prepare("INSERT INTO integration_logs(id,workspace_id,app_name,type,status,message,payload_ref,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(id,"wks_system","Platform Admin","api","success","D1 roundtrip",null,now).run();const row=await db.prepare("SELECT id FROM integration_logs WHERE id=? LIMIT 1").bind(id).first<{id:string}>();await db.prepare("DELETE FROM integration_logs WHERE id=?").bind(id).run();return NextResponse.json({status:"success",data:{persistenceDriver:"d1",roundtripReady:row?.id===id,createdAt:now}})}catch{return NextResponse.json({status:"error",data:{persistenceDriver:"d1",roundtripReady:false}},{status:503})}
}
