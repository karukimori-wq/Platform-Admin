import { AlertTriangle, Boxes, CircleDot, FileCheck2 } from "lucide-react";
import type {
  AppConnection,
  ContractStatus,
  DashboardMetric,
  IntegrationLog,
  Responsibility,
  WorkspaceSummary
} from "./types";

export const appConnections: AppConnection[] = [
  {
    id: "app_platform_admin",
    appName: "Platform Admin",
    repositoryUrl: "github.com/karukimori-wq/Platform-Admin",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-26 00:00",
    healthCheckUrl: "https://platform-admin.karukimori.workers.dev/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-06",
    updatedAt: "2026-08-26"
  },
  {
    id: "app_growth_engine",
    appName: "Growth Engine",
    repositoryUrl: "github.com/karukimori-wq/Growth-Engine",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-26 00:00",
    healthCheckUrl: "https://growth-engine-ruby-nine.vercel.app/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-26"
  },
  {
    id: "app_numeria_studio",
    appName: "Professional Studio",
    repositoryUrl: "github.com/karukimori-wq/numeria-studio",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-13 13:50",
    healthCheckUrl: "https://numeria-studio.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-26"
  },
  {
    id: "app_velvet",
    appName: "Velvet",
    repositoryUrl: "github.com/karukimori-wq/Velvet",
    status: "degraded",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-26 00:00",
    healthCheckUrl: "",
    healthCheckStatus: "skipped: VELVET_BASE_URL_NOT_CONFIGURED",
    createdAt: "2026-08-13",
    updatedAt: "2026-08-26"
  },
  {
    id: "app_sns_planner",
    appName: "SNS Planner",
    repositoryUrl: "github.com/karukimori-wq/sns-planner",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-26 00:00",
    healthCheckUrl: "https://sns-planner.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-26"
  },
  {
    id: "app_communication_planner",
    appName: "Communication Planner",
    repositoryUrl: "github.com/karukimori-wq/communication-planner",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-26 00:00",
    healthCheckUrl: "https://communication-planner.karukimori.workers.dev/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-26",
    updatedAt: "2026-08-26"
  },
  {
    id: "app_ai_platform_core",
    appName: "AI Platform Core",
    repositoryUrl: "github.com/karukimori-wq/ai-platform-core",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-26 00:00",
    healthCheckUrl: "https://ai-platform-core.karukimori.workers.dev/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-26"
  }
];

export const workspaces: WorkspaceSummary[] = [
  {
    workspaceId: "wks_numeria_001",
    ownerUserId: "user_owner_001",
    plan: "Business",
    stripeStatus: "connected",
    publicSiteStatus: "published",
    enabledApps: ["Platform Admin", "Growth Engine", "Professional Studio", "SNS Planner", "Communication Planner", "AI Platform Core"],
    createdAt: "2026-08-01",
    updatedAt: "2026-08-13"
  },
  {
    workspaceId: "wks_velvet_001",
    ownerUserId: "user_owner_velvet_001",
    plan: "Business",
    stripeStatus: "connected",
    publicSiteStatus: "published",
    enabledApps: ["Platform Admin", "Growth Engine", "Velvet", "SNS Planner", "Communication Planner", "AI Platform Core"],
    createdAt: "2026-08-13",
    updatedAt: "2026-08-13"
  },
  {
    workspaceId: "wks_trial_002",
    ownerUserId: "user_owner_002",
    plan: "Free",
    stripeStatus: "pending",
    publicSiteStatus: "draft",
    enabledApps: ["Growth Engine", "Professional Studio"],
    createdAt: "2026-08-03",
    updatedAt: "2026-08-13"
  }
];

export const integrationLogs: IntegrationLog[] = [
  {
    id: "log_001",
    workspaceId: "wks_numeria_001",
    appName: "Professional Studio",
    type: "event",
    status: "success",
    message: "studio.report.generated.v1 を受信",
    payloadRef: "payload/report_8201",
    createdAt: "2026-08-13 13:45:12"
  },
  {
    id: "log_002",
    workspaceId: "wks_velvet_001",
    appName: "Velvet",
    type: "event",
    status: "success",
    message: "velvet.visit.started.v1 を受信",
    payloadRef: "payload/visit_1001",
    createdAt: "2026-08-13 13:46:30"
  },
  {
    id: "log_003",
    workspaceId: "wks_velvet_001",
    appName: "SNS Planner",
    type: "event",
    status: "success",
    message: "sns.message_draft.created.v1 を受信",
    payloadRef: "payload/message_draft_1001",
    createdAt: "2026-08-13 13:47:08"
  },
  {
    id: "log_004",
    workspaceId: "wks_numeria_001",
    appName: "AI Platform Core",
    type: "ai",
    status: "success",
    message: "ai.usage.recorded.v1 を記録",
    payloadRef: "payload/usage_9211",
    createdAt: "2026-08-13 13:48:44"
  },
  {
    id: "log_005",
    workspaceId: "wks_numeria_001",
    appName: "Communication Planner",
    type: "event",
    status: "success",
    message: "communication.reply_safety.checked.v1 を監視",
    payloadRef: "payload/safety_check_ref_1001",
    createdAt: "2026-08-26 00:00:00"
  }
];

export const contractStatuses: ContractStatus[] = [
  {
    id: "contract_platform_admin",
    appName: "Platform Admin",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-13 13:50"
  },
  {
    id: "contract_growth_engine",
    appName: "Growth Engine",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-13 13:50"
  },
  {
    id: "contract_professional_studio",
    appName: "Professional Studio",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-13 13:50"
  },
  {
    id: "contract_velvet",
    appName: "Velvet",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "warning",
    issues: ["VELVET_BASE_URL_NOT_CONFIGURED: Cloudflare production endpoint is not canonical yet"],
    checkedAt: "2026-08-26 00:00"
  },
  {
    id: "contract_sns_planner",
    appName: "SNS Planner",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-13 13:50"
  },
  {
    id: "contract_ai_platform_core",
    appName: "AI Platform Core",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-13 13:50"
  },
  {
    id: "contract_communication_planner",
    appName: "Communication Planner",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-26 00:00"
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "管理アプリ", value: "7", helper: "Communication Planner included", icon: Boxes },
  { label: "準拠契約", value: "6/7", helper: "Velvet endpoint pending", icon: FileCheck2 },
  { label: "監視イベント", value: "30", helper: "Communication + Velvet + MessageDraft", icon: CircleDot },
  { label: "エラー", value: "0", helper: "No active snapshot error", icon: AlertTriangle }
];

export const contractDocuments = [
  "docs/contracts/shared-glossary.md",
  "docs/contracts/platform-boundaries.md",
  "docs/contracts/app-responsibilities.md",
  "docs/repositories/platform-admin.md",
  "docs/contracts/api-catalog.md",
  "docs/contracts/event-catalog.md",
  "docs/contracts/event-flow.md",
  "docs/contracts/identity-contract.md",
  "docs/contracts/data-ownership.md",
  "docs/contracts/observability-contract.md",
  "docs/repositories/communication-planner.md"
];

export const officialEvents = [
  "growth.customer.created.v1",
  "growth.customer.updated.v1",
  "growth.lead.converted.v1",
  "growth.reservation.created.v1",
  "growth.reservation.cancelled.v1",
  "studio.session.started.v1",
  "studio.session.completed.v1",
  "studio.report.generated.v1",
  "studio.service_reference.updated.v1",
  "velvet.visit.started.v1",
  "velvet.visit.completed.v1",
  "velvet.memory.updated.v1",
  "velvet.note.created.v1",
  "velvet.next_action.created.v1",
  "communication.message.received.v1",
  "communication.message.sent.v1",
  "communication.context.updated.v1",
  "communication.promise.created.v1",
  "communication.next_action.created.v1",
  "communication.reply_draft.created.v1",
  "communication.reply_safety.checked.v1",
  "communication.person_channel.linked.v1",
  "sns.post_draft.created.v1",
  "sns.post_draft.updated.v1",
  "sns.message_draft.created.v1",
  "sns.message_draft.updated.v1",
  "ai.activity.created.v1",
  "ai.activity.completed.v1",
  "ai.activity.failed.v1",
  "ai.usage.recorded.v1"
];

export const responsibilities: Responsibility[] = [
  { area: "Customer master", canonicalOwner: "Growth Engine" },
  { area: "Reservation / Visit Schedule", canonicalOwner: "Growth Engine" },
  { area: "Stripe payment state", canonicalOwner: "Growth Engine" },
  { area: "Sales / Revenue ledger", canonicalOwner: "Growth Engine" },
  { area: "Public site", canonicalOwner: "Growth Engine" },
  { area: "Repeat / referral / contact-measure Business state", canonicalOwner: "Growth Engine" },
  { area: "Appraisal session", canonicalOwner: "Professional Studio" },
  { area: "Report and PDF generation", canonicalOwner: "Professional Studio" },
  { area: "Velvet professional visit", canonicalOwner: "Velvet" },
  { area: "Velvet professional memory", canonicalOwner: "Velvet" },
  { area: "Velvet service notes and timeline", canonicalOwner: "Velvet" },
  { area: "Velvet next action / summary reference", canonicalOwner: "Velvet" },
  { area: "1-to-1 Unified Inbox", canonicalOwner: "Communication Planner" },
  { area: "Communication Person projection", canonicalOwner: "Communication Planner" },
  { area: "Channel identity linking", canonicalOwner: "Communication Planner" },
  { area: "Conversation / Message", canonicalOwner: "Communication Planner" },
  { area: "Conversation Context / Topic / Promise", canonicalOwner: "Communication Planner" },
  { area: "Communication NextAction", canonicalOwner: "Communication Planner" },
  { area: "ReplyDraft / SafetyCheck / send workflow", canonicalOwner: "Communication Planner" },
  { area: "SNS post draft", canonicalOwner: "SNS Planner" },
  { area: "SNS message draft", canonicalOwner: "SNS Planner" },
  { area: "AI activity execution", canonicalOwner: "AI Platform Core" },
  { area: "AI usage tracking", canonicalOwner: "AI Platform Core" },
  { area: "Capability registry", canonicalOwner: "AI Platform Core" },
  { area: "Contract definitions", canonicalOwner: "professional-platform-contracts" },
  { area: "Cross-app monitoring", canonicalOwner: "Platform Admin" }
];
