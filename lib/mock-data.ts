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
    lastSyncAt: "2026-08-06 22:00",
    healthCheckUrl: "https://platform-admin-preview.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-06",
    updatedAt: "2026-08-06"
  },
  {
    id: "app_growth_engine",
    appName: "Growth Engine",
    repositoryUrl: "github.com/karukimori-wq/growth-engine",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-05 21:38",
    healthCheckUrl: "https://growth-engine-api-preview.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
  },
  {
    id: "app_professional_studio",
    appName: "Professional Studio",
    repositoryUrl: "github.com/karukimori-wq/numeria-studio",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-05 21:36",
    healthCheckUrl: "https://numeria-studio.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
  },
  {
    id: "app_sns_planner",
    appName: "SNS Planner",
    repositoryUrl: "github.com/karukimori-wq/sns-planner",
    status: "degraded",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-05 21:31",
    healthCheckUrl: "https://sns-planner.illusionddt.chatgpt.site/health",
    healthCheckStatus: "event delay",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
  },
  {
    id: "app_ai_platform_core",
    appName: "AI Platform Core",
    repositoryUrl: "github.com/karukimori-wq/ai-platform-core",
    status: "healthy",
    contractVersion: "0.1.0",
    lastSyncAt: "2026-08-05 21:39",
    healthCheckUrl: "https://ai-platform-core-preview.illusionddt.chatgpt.site/health",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
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
    updatedAt: "2026-08-05"
  },
  {
    workspaceId: "wks_trial_002",
    ownerUserId: "user_owner_002",
    plan: "Free",
    stripeStatus: "pending",
    publicSiteStatus: "draft",
    enabledApps: ["Growth Engine", "Professional Studio"],
    createdAt: "2026-08-03",
    updatedAt: "2026-08-05"
  },
  {
    workspaceId: "wks_pro_003",
    ownerUserId: "user_owner_003",
    plan: "Pro",
    stripeStatus: "error",
    publicSiteStatus: "disabled",
    enabledApps: ["Growth Engine", "AI Platform Core"],
    createdAt: "2026-08-04",
    updatedAt: "2026-08-05"
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
    createdAt: "2026-08-05 21:40:12"
  },
  {
    id: "log_002",
    workspaceId: "wks_numeria_001",
    appName: "AI Platform Core",
    type: "ai",
    status: "success",
    message: "ai.usage.recorded.v1 を記録",
    payloadRef: "payload/usage_9211",
    createdAt: "2026-08-05 21:39:44"
  },
  {
    id: "log_003",
    workspaceId: "wks_trial_002",
    appName: "SNS Planner",
    type: "event",
    status: "warning",
    message: "sns.post_draft.updated.v1 の処理待ち",
    payloadRef: "payload/post_3190",
    createdAt: "2026-08-05 21:33:08"
  },
  {
    id: "log_004",
    workspaceId: "wks_pro_003",
    appName: "Growth Engine",
    type: "stripe_webhook",
    status: "failed",
    message: "Stripe Webhook の署名検証に失敗",
    payloadRef: "payload/stripe_1128",
    createdAt: "2026-08-05 21:28:51"
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
    checkedAt: "2026-08-06 22:00"
  },
  {
    id: "contract_growth_engine",
    appName: "Growth Engine",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-05 21:40"
  },
  {
    id: "contract_professional_studio",
    appName: "Professional Studio",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-05 21:40"
  },
  {
    id: "contract_sns_planner",
    appName: "SNS Planner",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "warning",
    issues: ["未処理イベントあり"],
    checkedAt: "2026-08-05 21:40"
  },
  {
    id: "contract_ai_platform_core",
    appName: "AI Platform Core",
    requiredContractVersion: "0.1.0",
    currentContractVersion: "0.1.0",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-05 21:40"
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "管理アプリ", value: "5", helper: "5 apps monitored", icon: Boxes },
  { label: "準拠契約", value: "4/5", helper: "SNS Planner は確認あり", icon: FileCheck2 },
  { label: "未処理イベント", value: "1", helper: "sns.post_draft.updated.v1", icon: CircleDot },
  { label: "エラー", value: "1", helper: "Stripe Webhook", icon: AlertTriangle }
];

export const contractDocuments = [
  "docs/contracts/shared-glossary.md",
  "docs/contracts/platform-boundaries.md",
  "docs/contracts/app-responsibilities.md",
  "docs/repositories/platform-admin.md",
  "docs/contracts/api-catalog.md",
  "docs/contracts/event-catalog.md",
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
  "sns.post_draft.created.v1",
  "sns.post_draft.updated.v1",
  "ai.activity.created.v1",
  "ai.activity.completed.v1",
  "ai.activity.failed.v1",
  "ai.usage.recorded.v1"
];

export const responsibilities: Responsibility[] = [
  { area: "Customer management", canonicalOwner: "Growth Engine" },
  { area: "Reservation management", canonicalOwner: "Growth Engine" },
  { area: "Stripe payment state", canonicalOwner: "Growth Engine" },
  { area: "Sales management", canonicalOwner: "Growth Engine" },
  { area: "Public site", canonicalOwner: "Growth Engine" },
  { area: "Service and menu publishing", canonicalOwner: "Growth Engine" },
  { area: "Appraisal session", canonicalOwner: "Professional Studio" },
  { area: "Report and PDF generation", canonicalOwner: "Professional Studio" },
  { area: "SNS post draft", canonicalOwner: "SNS Planner" },
  { area: "SNS post calendar", canonicalOwner: "SNS Planner" },
  { area: "AI activity execution", canonicalOwner: "AI Platform Core" },
  { area: "AI usage tracking", canonicalOwner: "AI Platform Core" },
  { area: "Capability registry", canonicalOwner: "AI Platform Core" },
  { area: "Contract definitions", canonicalOwner: "professional-platform-contracts" },
  { area: "Cross-app monitoring", canonicalOwner: "Platform Admin" }
];
