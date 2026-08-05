import type { LucideIcon } from "lucide-react";

export type AppStatus = "healthy" | "degraded" | "offline";
export type ContractStatusValue = "compliant" | "warning" | "mismatch";
export type LogStatus = "success" | "warning" | "failed";

export type AppName = "Growth Engine" | "Numeria Studio" | "SNS Planner" | "AI Platform Core";

export type AppConnection = {
  id: string;
  appName: AppName;
  repositoryUrl: string;
  status: AppStatus;
  contractVersion: string;
  lastSyncAt: string;
  healthCheckUrl: string;
  healthCheckStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceSummary = {
  workspaceId: string;
  ownerUserId: string;
  plan: "Free" | "Business" | "Pro";
  stripeStatus: "connected" | "pending" | "error";
  publicSiteStatus: "published" | "draft" | "disabled";
  enabledApps: AppName[];
  createdAt: string;
  updatedAt: string;
};

export type IntegrationLog = {
  id: string;
  workspaceId: string;
  appName: AppName;
  type: "api" | "event" | "ai" | "stripe_webhook" | "error";
  status: LogStatus;
  message: string;
  payloadRef: string;
  createdAt: string;
};

export type ContractStatus = {
  id: string;
  appName: AppName;
  requiredContractVersion: string;
  currentContractVersion: string;
  status: ContractStatusValue;
  issues: string[];
  checkedAt: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};
