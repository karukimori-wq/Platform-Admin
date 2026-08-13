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
    lastSyncAt: "2026-08-13 13:50",
    healthCheckUrl: "https://platform-admin-preview.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-06",
    updatedAt: "2026-08-13"
  },
  {
    id: "app_growth_engine",
    appName: "Growth Engine",
    repositoryUrl: "github.com/karukimori-wq/Growth-Engine",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-13 13:50",
    healthCheckUrl: "https://growth-engine-api-preview.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-13"
  },
  {
    id: "app_professional_studio",
    appName: "Professional Studio",
    repositoryUrl: "github.com/karukimori-wq/numeria-studio",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-13 13:50",
    healthCheckUrl: "https://numeria-studio.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-13"
  },
  {
    id: "app_velvet",
    appName: "Velvet",
    repositoryUrl: "github.com/karukimori-wq/Velvet",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-13 13:50",
    healthCheckUrl: "https://velvet.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-13",
    updatedAt: "2026-08-13"
  },
  {
    id: "app_sns_planner",
    appName: "SNS Planner",
    repositoryUrl: "github.com/karukimori-wq/sns-planner",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-13 13:50",
    healthCheckUrl: "https://sns-planner.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-13"
  },
  {
    id: "app_ai_platform_core",
    appName: "AI Platform Core",
    repositoryUrl: "github.com/karukimori-wq/ai-platform-core",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-13 13:50",
    healthCheckUrl: "https://ai-platform-core-preview.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-13"
  }
];

export const workspaces: WorkspaceSummary[] = [
  {
    workspaceId: "wks_numeria_001",
    ownerUserId: "user_owner_001",
    plan: "Business",
    stripeStatus: "connected",
    publicSiteStatus: "published",
    enabledApps: ["Platform Admin", "Growth Engine", "Professional Studio", "SNS Planner", "AI Platform Core"],
    createdAt: "2026-08-01",
    updatedAt: "2026-08-13"
  },
  {
    workspaceId: "wks_velvet_001",
    ownerUserId: "user_owner_velvet_001",
    plan: "Business",
    stripeStatus: "connected",
    publicSiteStatus: "published",
    enabledApps: ["Platform Admin", "Growth Engine", "Velvet", "SNS Planner", "AI Platform Core"],
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
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-13 13:50"
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
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "管理アプリ", value: "6", helper: "Velvet included", icon: Boxes },
  { label: "準拠契約", value: "6/6", helper: "0.1.0 contracts", icon: FileCheck2 },
  { label: "監視イベント", value: "22", helper: "Velvet + MessageDraft included", icon: CircleDot },
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
  "docs/contracts/data-ownership.md"
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
  { area: "SNS post draft", canonicalOwner: "SNS Planner" },
  { area: "SNS message draft", canonicalOwner: "SNS Planner" },
  { area: "AI activity execution", canonicalOwner: "AI Platform Core" },
  { area: "AI usage tracking", canonicalOwner: "AI Platform Core" },
  { area: "Capability registry", canonicalOwner: "AI Platform Core" },
  { area: "Contract definitions", canonicalOwner: "professional-platform-contracts" },
  { area: "Cross-app monitoring", canonicalOwner: "Platform Admin" }
];
