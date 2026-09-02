import type { PlanReadinessCheck, PlanReleaseReadiness, ReadinessStatus, ReleasePlanAppName } from "./types";

type Probe = {
  ok: boolean;
  skipped?: boolean;
  statusCode: number | null;
  data: Record<string, unknown> | null;
  errorMessage: string;
};

type PlanAppConfig = {
  appName: ReleasePlanAppName;
  baseUrl: string;
  missingBaseUrlIssue?: string;
};

const baseUrl = (key: string, fallback: string) => (process.env[key] ?? fallback).replace(/\/$/, "");
const optionalBaseUrl = (key: string) => (process.env[key] ?? "").replace(/\/$/, "");

const planApps: PlanAppConfig[] = [
  {
    appName: "numeria-studio",
    baseUrl: baseUrl("NUMERIA_STUDIO_BASE_URL", "https://numeria-studio.illusionddt.chatgpt.site")
  },
  {
    appName: "velvet",
    baseUrl: optionalBaseUrl("VELVET_BASE_URL"),
    missingBaseUrlIssue: "VELVET_BASE_URL_NOT_CONFIGURED"
  }
];

export async function runPlanReadinessChecks() {
  const checkedAt = new Date().toISOString();
  const apps = await Promise.all(planApps.map((app) => checkPlanApp(app, checkedAt)));
  const status = apps.some((app) => app.productionStatus === "error")
    ? "error"
    : apps.some((app) => app.issues.length > 0 || app.productionStatus === "warning" || app.productionStatus === "skipped")
      ? "warning"
      : "success";

  return { status, data: apps, count: apps.length, checkedAt };
}

async function checkPlanApp(app: PlanAppConfig, checkedAt: string): Promise<PlanReleaseReadiness> {
  if (!app.baseUrl) return skippedApp(app, checkedAt);

  const [health, version, contracts, plans, entitlements, usage, billing, feedback, aiUsage] = await Promise.all([
    probe(`${app.baseUrl}/health`),
    probe(`${app.baseUrl}/version`),
    probe(`${app.baseUrl}/contracts/status`),
    probe(`${app.baseUrl}/api/plans/status`),
    probe(`${app.baseUrl}/api/entitlements/status`),
    probe(`${app.baseUrl}/api/usage/status`),
    probe(`${app.baseUrl}/api/billing/webhook/status`),
    probe(`${app.baseUrl}/api/feedback/status`),
    probe(`${baseUrl("AI_PLATFORM_CORE_BASE_URL", "https://ai-platform-core.karukimori.workers.dev")}/api/usage/status`)
  ]);

  const contractData = contracts.data ?? {};
  const planData = plans.data ?? {};
  const entitlementData = entitlements.data ?? {};
  const usageData = usage.data ?? {};
  const billingData = billing.data ?? {};
  const feedbackData = feedback.data ?? {};
  const aiUsageData = aiUsage.data ?? {};
  const freePlanConfigured = statusFromBoolean(findBoolean(planData, ["freeConfigured", "freePlanConfigured"], contractData, ["freePlanConfigured"]));
  const proPlanConfigured = statusFromBoolean(findBoolean(planData, ["proConfigured", "proPlanConfigured"], contractData, ["proPlanConfigured"]));
  const businessPlanStatus = businessUnavailableStatus(planData, contractData);
  const entitlementApiStatus = endpointStatus(entitlements, "Entitlement API");
  const usageAggregationStatus = endpointStatus(usage, "Usage aggregation");
  const planChangeSyncStatus = statusFromBoolean(findBoolean(planData, ["planChangeSyncReady", "planChangeReflectionReady"], entitlementData, ["planChangeSyncReady"]));
  const limitDecisionStatus = statusFromBoolean(findBoolean(entitlementData, ["limitDecisionReady", "freeLimitDecisionReady"], usageData, ["limitDecisionReady"]));
  const aiPlatformUsageLinkStatus = endpointStatus(aiUsage, "AI Platform Core usage link");
  const feedbackHubLinkStatus = endpointStatus(feedback, "Feedback Hub link");

  const checks: PlanReadinessCheck[] = [
    check("production", "Production endpoint", health.ok ? "success" : "error", health.ok ? "health reachable" : health.errorMessage, checkedAt),
    check("contracts", "contracts/status", contracts.ok ? "success" : "warning", contracts.ok ? "contract snapshot reachable" : contracts.errorMessage, checkedAt),
    check("free-plan", "Free plan configured", freePlanConfigured, statusDetail(freePlanConfigured, "Free plan enabled"), checkedAt),
    check("pro-plan", "Pro plan configured", proPlanConfigured, statusDetail(proPlanConfigured, "Pro plan enabled"), checkedAt),
    check("business-unavailable", "Business unavailable", businessPlanStatus, statusDetail(businessPlanStatus, "Business is preparation-only and not purchasable"), checkedAt),
    check("entitlement-api", "Entitlement decision API", entitlementApiStatus, endpointDetail(entitlements), checkedAt),
    check("usage", "Usage aggregation", usageAggregationStatus, endpointDetail(usage), checkedAt),
    check("billing-webhook", "Billing webhook last success", billingWebhookStatus(billingData), billingWebhookDetail(billingData, billing), checkedAt),
    check("plan-change", "Plan change reflection", planChangeSyncStatus, statusDetail(planChangeSyncStatus, "Plan changes can be reflected"), checkedAt),
    check("limit-decision", "Usage limit decision", limitDecisionStatus, statusDetail(limitDecisionStatus, "Free limits and Pro permissions can be decided"), checkedAt),
    check("ai-platform-usage", "AI Platform Core usage link", aiPlatformUsageLinkStatus, endpointDetail(aiUsage), checkedAt),
    check("feedback-hub", "Feedback Hub entrypoint", feedbackHubLinkStatus, endpointDetail(feedback), checkedAt)
  ];
  const issues = checks.filter((item) => item.status !== "success").map((item) => `${item.key}: ${item.detail}`);

  return {
    appName: app.appName,
    baseUrl: app.baseUrl,
    productionStatus: health.ok ? "success" : "error",
    healthStatus: health.ok ? "200 OK" : formatFailure(health),
    appVersion: asString(version.data?.appVersion) || asString(version.data?.version),
    appContractVersion: asString(contractData.contractVersion),
    planContractVersion: asString(planData.planContractVersion) || asString(contractData.planContractVersion),
    freePlanConfigured,
    proPlanConfigured,
    businessPlanStatus,
    entitlementApiStatus,
    usageAggregationStatus,
    billingWebhookLastSuccessAt: safeTimestamp(billingData.lastSuccessAt),
    planChangeSyncStatus,
    limitDecisionStatus,
    aiPlatformUsageLinkStatus,
    feedbackHubLinkStatus,
    checks,
    issues,
    lastCheckedAt: checkedAt
  };
}

function skippedApp(app: PlanAppConfig, checkedAt: string): PlanReleaseReadiness {
  const issue = app.missingBaseUrlIssue ?? "BASE_URL_NOT_CONFIGURED";
  const checks = [
    check("production", "Production endpoint", "skipped", issue, checkedAt),
    check("contracts", "contracts/status", "skipped", issue, checkedAt),
    check("free-plan", "Free plan configured", "skipped", issue, checkedAt),
    check("pro-plan", "Pro plan configured", "skipped", issue, checkedAt),
    check("business-unavailable", "Business unavailable", "skipped", issue, checkedAt),
    check("entitlement-api", "Entitlement decision API", "skipped", issue, checkedAt),
    check("usage", "Usage aggregation", "skipped", issue, checkedAt),
    check("billing-webhook", "Billing webhook last success", "skipped", issue, checkedAt),
    check("plan-change", "Plan change reflection", "skipped", issue, checkedAt),
    check("limit-decision", "Usage limit decision", "skipped", issue, checkedAt),
    check("ai-platform-usage", "AI Platform Core usage link", "skipped", issue, checkedAt),
    check("feedback-hub", "Feedback Hub entrypoint", "skipped", issue, checkedAt)
  ];

  return {
    appName: app.appName,
    baseUrl: "",
    productionStatus: "skipped",
    healthStatus: "SKIPPED",
    appVersion: "",
    appContractVersion: "",
    planContractVersion: "",
    freePlanConfigured: "skipped",
    proPlanConfigured: "skipped",
    businessPlanStatus: "skipped",
    entitlementApiStatus: "skipped",
    usageAggregationStatus: "skipped",
    billingWebhookLastSuccessAt: "not available",
    planChangeSyncStatus: "skipped",
    limitDecisionStatus: "skipped",
    aiPlatformUsageLinkStatus: "skipped",
    feedbackHubLinkStatus: "skipped",
    checks,
    issues: checks.map((item) => `${item.key}: ${item.detail}`),
    lastCheckedAt: checkedAt
  };
}

async function probe(url: string): Promise<Probe> {
  try {
    const response = await fetch(url, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(10000) });
    const text = await response.text();
    return { ok: response.ok, statusCode: response.status, data: unwrapEnvelope(parseJson(text)), errorMessage: response.ok ? "" : `HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, statusCode: null, data: null, errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

function check(key: string, label: string, status: ReadinessStatus, detail: string, checkedAt: string): PlanReadinessCheck {
  return { key, label, status, detail, checkedAt };
}

function endpointStatus(probeResult: Probe, label: string): ReadinessStatus {
  if (probeResult.skipped) return "skipped";
  if (probeResult.ok) return "success";
  if (probeResult.statusCode === 404) return "warning";
  return label ? "warning" : "warning";
}

function endpointDetail(probeResult: Probe) {
  if (probeResult.ok) return "reachable";
  return probeResult.errorMessage || "not reachable";
}

function statusFromBoolean(value: boolean | null): ReadinessStatus {
  if (value === true) return "success";
  if (value === false) return "error";
  return "warning";
}

function businessUnavailableStatus(planData: Record<string, unknown>, contractData: Record<string, unknown>): ReadinessStatus {
  const status = asString(planData.businessPlanStatus) || asString(contractData.businessPlanStatus);
  const purchasable = findBoolean(planData, ["businessPurchasable", "businessPlanPurchasable"], contractData, ["businessPurchasable"]);
  if (status === "preparing" || status === "not_purchasable" || purchasable === false) return "success";
  if (purchasable === true) return "error";
  return "warning";
}

function billingWebhookStatus(data: Record<string, unknown>): ReadinessStatus {
  return safeTimestamp(data.lastSuccessAt) === "not available" ? "warning" : "success";
}

function billingWebhookDetail(data: Record<string, unknown>, probeResult: Probe) {
  const timestamp = safeTimestamp(data.lastSuccessAt);
  if (timestamp !== "not available") return `last success ${timestamp}`;
  return endpointDetail(probeResult);
}

function statusDetail(status: ReadinessStatus, successDetail: string) {
  if (status === "success") return successDetail;
  if (status === "error") return "explicitly failed";
  if (status === "skipped") return "not configured";
  return "not reported";
}

function findBoolean(a: Record<string, unknown>, aKeys: string[], b: Record<string, unknown>, bKeys: string[]) {
  for (const key of aKeys) if (typeof a[key] === "boolean") return a[key] as boolean;
  for (const key of bKeys) if (typeof b[key] === "boolean") return b[key] as boolean;
  return null;
}

function safeTimestamp(value: unknown) {
  return typeof value === "string" && value ? value : "not available";
}

function formatFailure(result: Probe) {
  return result.statusCode ? `${result.statusCode} ERROR` : "FETCH ERROR";
}

function unwrapEnvelope(value: Record<string, unknown> | null) {
  if (!value) return null;
  const data = value.data;
  if (typeof data === "object" && data !== null && !Array.isArray(data)) return data as Record<string, unknown>;
  return value;
}

function parseJson(text: string) {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}