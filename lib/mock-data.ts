import { AlertTriangle, Boxes, CircleDot, FileCheck2 } from "lucide-react";
import type { AppConnection, ContractStatus, DashboardMetric, IntegrationLog, WorkspaceSummary } from "./types";

export const appConnections: AppConnection[] = [
  {
    id: "app_growth_engine",
    appName: "Growth Engine",
    repositoryUrl: "github.com/karukimori-wq/growth-engine",
    status: "healthy",
    contractVersion: "v0.1",
    lastSyncAt: "2026-08-05 21:38",
    healthCheckUrl: "/api/health/growth-engine",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
  },
  {
    id: "app_numeria_studio",
    appName: "Numeria Studio",
    repositoryUrl: "github.com/karukimori-wq/numeria-studio",
    status: "healthy",
    contractVersion: "v0.1",
    lastSyncAt: "2026-08-05 21:36",
    healthCheckUrl: "/api/health/numeria-studio",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
  },
  {
    id: "app_sns_planner",
    appName: "SNS Planner",
    repositoryUrl: "github.com/karukimori-wq/sns-planner",
    status: "degraded",
    contractVersion: "v0.1",
    lastSyncAt: "2026-08-05 21:31",
    healthCheckUrl: "/api/health/sns-planner",
    healthCheckStatus: "event delay",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
  },
  {
    id: "app_ai_platform_core",
    appName: "AI Platform Core",
    repositoryUrl: "github.com/karukimori-wq/ai-platform-core",
    status: "healthy",
    contractVersion: "v0.1",
    lastSyncAt: "2026-08-05 21:39",
    healthCheckUrl: "/api/health/ai-platform-core",
    healthCheckStatus: "200 OK",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05"
  }
];

export const workspaces: WorkspaceSummary[] = [
  {
    workspaceId: "ws_numeria_001",
    ownerUserId: "user_owner_001",
    plan: "Business",
    stripeStatus: "connected",
    publicSiteStatus: "published",
    enabledApps: ["Growth Engine", "Numeria Studio", "SNS Planner", "AI Platform Core"],
    createdAt: "2026-08-01",
    updatedAt: "2026-08-05"
  },
  {
    workspaceId: "ws_trial_002",
    ownerUserId: "user_owner_002",
    plan: "Free",
    stripeStatus: "pending",
    publicSiteStatus: "draft",
    enabledApps: ["Growth Engine", "Numeria Studio"],
    createdAt: "2026-08-03",
    updatedAt: "2026-08-05"
  },
  {
    workspaceId: "ws_pro_003",
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
    workspaceId: "ws_numeria_001",
    appName: "Numeria Studio",
    type: "event",
    status: "success",
    message: "studio.report.generated.v1 を受信",
    payloadRef: "payload/report_8201",
    createdAt: "2026-08-05 21:40:12"
  },
  {
    id: "log_002",
    workspaceId: "ws_numeria_001",
    appName: "AI Platform Core",
    type: "ai",
    status: "success",
    message: "ai.usage.recorded.v1 を記録",
    payloadRef: "payload/usage_9211",
    createdAt: "2026-08-05 21:39:44"
  },
  {
    id: "log_003",
    workspaceId: "ws_trial_002",
    appName: "SNS Planner",
    type: "event",
    status: "warning",
    message: "sns.post_draft.updated.v1 の処理待ち",
    payloadRef: "payload/post_3190",
    createdAt: "2026-08-05 21:33:08"
  },
  {
    id: "log_004",
    workspaceId: "ws_pro_003",
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
    id: "contract_growth_engine",
    appName: "Growth Engine",
    requiredContractVersion: "v0.1",
    currentContractVersion: "v0.1",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-05 21:40"
  },
  {
    id: "contract_numeria_studio",
    appName: "Numeria Studio",
    requiredContractVersion: "v0.1",
    currentContractVersion: "v0.1",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-05 21:40"
  },
  {
    id: "contract_sns_planner",
    appName: "SNS Planner",
    requiredContractVersion: "v0.1",
    currentContractVersion: "v0.1",
    status: "warning",
    issues: ["未処理イベントあり"],
    checkedAt: "2026-08-05 21:40"
  },
  {
    id: "contract_ai_platform_core",
    appName: "AI Platform Core",
    requiredContractVersion: "v0.1",
    currentContractVersion: "v0.1",
    status: "compliant",
    issues: [],
    checkedAt: "2026-08-05 21:40"
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "管理アプリ", value: "4", helper: "4 apps monitored", icon: Boxes },
  { label: "準拠契約", value: "3/4", helper: "SNS Planner は確認あり", icon: FileCheck2 },
  { label: "未処理イベント", value: "1", helper: "sns.post_draft.updated.v1", icon: CircleDot },
  { label: "エラー", value: "1", helper: "Stripe Webhook", icon: AlertTriangle }
];

export const contractDocuments = [
  "docs/contracts.md",
  "docs/integration.md",
  "docs/contracts/api-catalog.md",
  "docs/contracts/event-catalog.md",
  "docs/contracts/identity-contract.md",
  "docs/contracts/data-ownership.md"
];

export const officialEvents = [
  "studio.session.started.v1",
  "studio.session.completed.v1",
  "studio.report.generated.v1",
  "sns.post_draft.created.v1",
  "sns.post_draft.updated.v1",
  "ai.activity.created.v1",
  "ai.activity.completed.v1",
  "ai.activity.failed.v1",
  "ai.usage.recorded.v1"
];
