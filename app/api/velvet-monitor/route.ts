import { NextResponse } from "next/server";

async function probe(url: string, init?: RequestInit) {
  try {
    const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(10000) });
    const text = await response.text();
    let data: unknown = null;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: response.ok, statusCode: response.status, data };
  } catch (error) {
    return { ok: false, statusCode: null, data: error instanceof Error ? error.message : String(error) };
  }
}

export async function GET() {
  const velvetBase = (process.env.VELVET_BASE_URL ?? "").replace(/\/$/, "");
  const growthBase = (process.env.GROWTH_ENGINE_BASE_URL ?? "https://growth-engine-ruby-nine.vercel.app").replace(/\/$/, "");
  const snsBase = (process.env.SNS_PLANNER_BASE_URL ?? "https://sns-planner.illusionddt.chatgpt.site").replace(/\/$/, "");
  const checkedAt = new Date().toISOString();

  if (!velvetBase) {
    return NextResponse.json({ status: "warning", checkedAt, issue: "VELVET_BASE_URL_NOT_CONFIGURED", velvet: { status: "not_run" } });
  }

  const [health, version, contracts, messageMetadata, postMetadata, growthHandoff] = await Promise.all([
    probe(`${velvetBase}/health`),
    probe(`${velvetBase}/version`),
    probe(`${velvetBase}/contracts/status`),
    probe(`${snsBase}/api/message-drafts/metadata`),
    probe(`${snsBase}/api/post-drafts/metadata`),
    probe(`${growthBase}/api/integrations/velvet/visit-start-test`, { method: "POST", headers: { "content-type": "application/json", "X-Source-App": "platform-admin" } }),
  ]);

  const allCore = health.ok && version.ok && contracts.ok;
  return NextResponse.json({
    status: allCore ? "success" : "warning",
    checkedAt,
    velvet: {
      health,
      version,
      contracts,
      requiredApis: ["VelvetVisit.Start", "VelvetVisit.Complete", "VelvetMemory.Get", "VelvetMemory.Update", "VelvetNote.Create", "VelvetTimeline.List", "VelvetNextAction.Create"],
      requiredEvents: ["velvet.visit.started.v1", "velvet.visit.completed.v1", "velvet.memory.updated.v1", "velvet.note.created.v1", "velvet.next_action.created.v1"],
      ownership: { customerOwner: "growth-engine", paymentOwner: "growth-engine", salesOwner: "growth-engine", professionalMemoryOwner: "velvet" },
    },
    messageDraft: {
      metadata: messageMetadata,
      postMetadata,
      owner: "sns-planner",
      caller: "growth-engine",
      targetStudio: "velvet",
      eventName: "sns.message_draft.created.v1",
    },
    growthToVelvet: growthHandoff,
  });
}
