import type { PlanReadinessCheck, PlanReleaseReadiness, ReadinessStatus, ReleasePlanAppName } from "./types";

type Probe = {
  ok: boolean;
  skipped?: boolean;
  endpoint: string;
  statusCode: number | null;
  data: Record<string, unknown> | null;
  errorMessage: string;
};

type PlanAppConfig = {
  appName: ReleasePlanAppName;
  appId: string;
  baseUrl: string;
  missingBaseUrlIssue?: string;
};

type EndpointProbe = Probe | null;

const baseUrl = (key: string, fallback: string) => (process.env[key] ?? fallback).replace(/\/$/, "");
const optionalBaseUrl = (key: string) => (process.env[key] ?? "").replace(/\/$/, "");

const planApps: PlanAppConfig[] = [
  {
    appName: "numeria-studio",
    appId: "numeria-studio",
    baseUrl: baseUrl("NUMERIA_STUDIO_BASE_URL", "https://numeria-studio.com")
  },
  {
    appName: "velvet",
    appId: "velvet",
    baseUrl: optionalBaseUrl("VELVET_BASE_URL"),
    missingBaseUrlIssue: "VELVET_BASE_URL_NOT_CONFIGURED"
  },
  {
    appName: "ai-platform-core",
    appId: "ai-platform-core",
    baseUrl: baseUrl("AI_PLATFORM_CORE_BASE_URL", "https://ai-platform-core.karukimori.workers.dev")
  },
  {
    appName: "feedback-hub",
    appId: "feedback-hub",
    baseUrl: optionalBaseUrl("FEEDBACK_HUB_BASE_URL"),
    missingBaseUrlIssue: "FEEDBACK_HUB_BASE_URL_NOT_CONFIGURED"
  },
  {
    appName: "growth-engine",
    appId: "growth-engine",
    baseUrl: baseUrl("GROWTH_ENGINE_BASE_URL", "https://growth-engine.karukimori.workers.dev")
  }
];

const requiredCheckKeys = [
  "production",
  "version",
  "contracts",
  "release",
  "auth",
  "persistence",
  "database",
  "free-plan",
  "pro-plan",
  "business-unavailable",
  "entitlement-api",
  "usage",
  "plan-change",
  "limit-decision",
  "ai-platform-usage",
  "feedback-hub",
  "deploy",
  "error-categories"
] as const;

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

  const [health, version, contracts, release, auth, persistence, entitlements, usage, feedback, aiUsage] = await Promise.all([
    probe(app.baseUrl, ["/health"]),
    probe(app.baseUrl, ["/version"]),
    probe(app.baseUrl, ["/contracts/status"]),
    probe(app.baseUrl, ["/release/status", "/api/release/status", "/api/plans/status"]),
    probe(app.baseUrl, ["/auth/status", "/api/auth/status"]),
    probe(app.baseUrl, ["/persistence/status", "/api/persistence/status"]),
    probe(app.baseUrl, ["/entitlements/status", "/api/entitlements/status"]),
    probe(app.baseUrl, ["/usage/status", "/api/usage/status"]),
    probe(app.baseUrl, ["/feedback/status", "/api/feedback/status"]),
    probe(baseUrl("AI_PLATFORM_CORE_BASE_URL", "https://ai-platform-core.karukimori.workers.dev"), ["/usage/status", "/api/usage/status"])
  ]);

  const versionData = version.data ?? {};
  const contractData = contracts.data ?? {};
  const releaseData = release.data ?? {};
  const authData = auth.data ?? {};
  const persistenceData = persistence.data ?? {};
  const entitlementData = entitlements.data ?? {};
  const usageData = usage.data ?? {};
  const feedbackData = feedback.data ?? {};
  const appVersion = firstString(readPath(versionData, ["appVersion"]), readPath(versionData, ["version"]), readPath(releaseData, ["appVersion"]));
  const appContractVersion = firstString(readPath(contractData, ["contractVersion"]), readPath(versionData, ["contractVersion"]));
  const planContractVersion = firstString(
    readPath(releaseData, ["planContractVersion"]),
    readPath(releaseData, ["planContract", "version"]),
    readPath(releaseData, ["plans", "contractVersion"]),
    readPath(contractData, ["planContractVersion"]),
    readPath(contractData, ["planContract", "version"])
  );
  const releaseScope = firstString(readPath(releaseData, ["releaseScope"]), readPath(contractData, ["releaseScope"]), "free-pro");
  const freePlanConfigured = statusFromBoolean(firstBoolean(
    readPath(releaseData, ["freePlanConfigured"]),
    readPath(releaseData, ["freeConfigured"]),
    readPath(releaseData, ["plans", "free", "enabled"]),
    readPath(releaseData, ["plans", "free", "configured"]),
    readPath(contractData, ["freePlanConfigured"]),
    readPath(contractData, ["plans", "free", "enabled"])
  ));
  const proPlanConfigured = statusFromBoolean(firstBoolean(
    readPath(releaseData, ["proPlanConfigured"]),
    readPath(releaseData, ["proConfigured"]),
    readPath(releaseData, ["plans", "pro", "enabled"]),
    readPath(releaseData, ["plans", "pro", "configured"]),
    readPath(contractData, ["proPlanConfigured"]),
    readPath(contractData, ["plans", "pro", "enabled"])
  ));
  const businessPlanStatus = businessUnavailableStatus(releaseData, contractData);
  const entitlementApiStatus = combinedStatus(endpointStatus(entitlements), readinessStatusFromData(entitlementData, ["entitlementReady", "entitlementDecisionReady", "ready"]));
  const usageAggregationStatus = combinedStatus(endpointStatus(usage), readinessStatusFromData(usageData, ["usageAggregationReady", "usageReady", "ready"]));
  const authReadinessStatus = combinedStatus(endpointStatus(auth), readinessStatusFromData(authData, ["authReady", "authenticationReady", "ready"]));
  const persistenceReadinessStatus = combinedStatus(endpointStatus(persistence), readinessStatusFromData(persistenceData, ["persistenceReady", "databaseBackedPersistenceReady", "ready"]));
  const databaseReadinessStatus = databaseStatus(persistenceData);
  const planChangeSyncStatus = statusFromBoolean(firstBoolean(
    readPath(releaseData, ["planChangeSyncReady"]),
    readPath(releaseData, ["planChangeReflectionReady"]),
    readPath(releaseData, ["planChangeReflection", "ready"]),
    statusEquals(readPath(releaseData, ["planChangeReflection", "status"]), "ready"),
    readPath(entitlementData, ["planChangeSyncReady"]),
    readPath(entitlementData, ["planChangeReflectionReady"])
  ));
  const limitDecisionStatus = statusFromBoolean(firstBoolean(
    readPath(entitlementData, ["limitDecisionReady"]),
    readPath(entitlementData, ["freeLimitDecisionReady"]),
    readPath(entitlementData, ["proPermissionDecisionReady"]),
    readPath(entitlementData, ["limitDecision", "ready"]),
    statusEquals(readPath(entitlementData, ["limitDecision", "status"]), "ready"),
    readPath(usageData, ["limitDecisionReady"]),
    readPath(releaseData, ["freeLimitReady"])
  ));
  const aiPlatformUsageLinkStatus = combinedStatus(endpointStatus(aiUsage), statusFromBoolean(firstBoolean(
    readPath(usageData, ["aiPlatformCoreLinked"]),
    readPath(usageData, ["aiUsageIntegrationReady"]),
    readPath(usageData, ["integrations", "aiPlatformCore", "ready"]),
    readPath(releaseData, ["aiPlatformCoreLinked"]),
    readPath(contractData, ["aiPlatformCoreUsageLinked"])
  )));
  const feedbackHubLinkStatus = combinedStatus(endpointStatus(feedback), statusFromBoolean(firstBoolean(
    readPath(feedbackData, ["feedbackHubReady"]),
    readPath(feedbackData, ["feedbackEntrypointReady"]),
    readPath(feedbackData, ["entrypoint", "ready"]),
    readPath(releaseData, ["feedbackHubReady"]),
    readPath(contractData, ["feedbackHubEntrypointReady"])
  )));
  const releaseDeployStatus = deployStatus(releaseData, version);
  const primaryErrorCategories = errorCategories(releaseData, authData, persistenceData, entitlementData, usageData);
  const errorCategoryStatus: ReadinessStatus = primaryErrorCategories.length === 0 ? "success" : "warning";

  const checks: PlanReadinessCheck[] = [
    check("production", "Production endpoint", health.ok ? "success" : "error", health.ok ? "health reachable" : endpointDetail(health), checkedAt),
    check("version", "version", version.ok ? "success" : "warning", endpointDetail(version), checkedAt),
    check("contracts", "contracts/status", contracts.ok ? "success" : "warning", endpointDetail(contracts), checkedAt),
    check("release", "release/status", endpointStatus(release), endpointDetail(release), checkedAt),
    check("auth", "auth/status", authReadinessStatus, statusDetail(authReadinessStatus, "auth ready"), checkedAt),
    check("persistence", "persistence/status", persistenceReadinessStatus, statusDetail(persistenceReadinessStatus, "persistence ready"), checkedAt),
    check("database", "D1 / DB readiness", databaseReadinessStatus, statusDetail(databaseReadinessStatus, "database ready"), checkedAt),
    check("free-plan", "Free plan configured", freePlanConfigured, statusDetail(freePlanConfigured, "Free plan enabled"), checkedAt),
    check("pro-plan", "Pro plan configured", proPlanConfigured, statusDetail(proPlanConfigured, "Pro plan enabled"), checkedAt),
    check("business-unavailable", "Business unavailable", businessPlanStatus, statusDetail(businessPlanStatus, "Business is preparation-only and not purchasable"), checkedAt),
    check("entitlement-api", "Entitlement decision", entitlementApiStatus, statusDetail(entitlementApiStatus, "entitlement ready"), checkedAt),
    check("usage", "Usage aggregation", usageAggregationStatus, statusDetail(usageAggregationStatus, "usage aggregation ready"), checkedAt),
    check("plan-change", "Plan change reflection", planChangeSyncStatus, statusDetail(planChangeSyncStatus, "plan changes can be reflected"), checkedAt),
    check("limit-decision", "Free limit / Pro permission", limitDecisionStatus, statusDetail(limitDecisionStatus, "limits and permissions can be decided"), checkedAt),
    check("ai-platform-usage", "AI Platform Core link", aiPlatformUsageLinkStatus, statusDetail(aiPlatformUsageLinkStatus, "AI Platform Core linked"), checkedAt),
    check("feedback-hub", "Feedback Hub entrypoint", feedbackHubLinkStatus, statusDetail(feedbackHubLinkStatus, "Feedback Hub reachable"), checkedAt),
    check("deploy", "Latest deploy", releaseDeployStatus, statusDetail(releaseDeployStatus, "latest deploy ready"), checkedAt),
    check("error-categories", "Primary error categories", errorCategoryStatus, primaryErrorCategories.join(", ") || "none reported", checkedAt)
  ];
  const issues = checks.filter((item) => item.status !== "success").map((item) => `${item.key}: ${item.detail}`);

  return {
    appName: app.appName,
    appId: firstString(readPath(releaseData, ["appId"]), readPath(versionData, ["appId"]), app.appId),
    baseUrl: app.baseUrl,
    productionStatus: health.ok ? "success" : "error",
    healthStatus: health.ok ? "200 OK" : formatFailure(health),
    appVersion,
    appContractVersion,
    planContractVersion,
    releaseScope,
    freePlanConfigured,
    proPlanConfigured,
    businessPlanStatus,
    entitlementApiStatus,
    usageAggregationStatus,
    authReadinessStatus,
    persistenceReadinessStatus,
    databaseReadinessStatus,
    releaseDeployStatus,
    planChangeSyncStatus,
    limitDecisionStatus,
    aiPlatformUsageLinkStatus,
    feedbackHubLinkStatus,
    primaryErrorCategories,
    checks,
    issues,
    lastCheckedAt: checkedAt
  };
}

function skippedApp(app: PlanAppConfig, checkedAt: string): PlanReleaseReadiness {
  const issue = app.missingBaseUrlIssue ?? "BASE_URL_NOT_CONFIGURED";
  const checks = requiredCheckKeys.map((key) => check(key, labelForKey(key), "skipped", issue, checkedAt));

  return {
    appName: app.appName,
    appId: app.appId,
    baseUrl: "",
    productionStatus: "skipped",
    healthStatus: "SKIPPED",
    appVersion: "",
    appContractVersion: "",
    planContractVersion: "",
    releaseScope: "",
    freePlanConfigured: "skipped",
    proPlanConfigured: "skipped",
    businessPlanStatus: "skipped",
    entitlementApiStatus: "skipped",
    usageAggregationStatus: "skipped",
    authReadinessStatus: "skipped",
    persistenceReadinessStatus: "skipped",
    databaseReadinessStatus: "skipped",
    releaseDeployStatus: "skipped",
    planChangeSyncStatus: "skipped",
    limitDecisionStatus: "skipped",
    aiPlatformUsageLinkStatus: "skipped",
    feedbackHubLinkStatus: "skipped",
    primaryErrorCategories: [issue],
    checks,
    issues: checks.map((item) => `${item.key}: ${item.detail}`),
    lastCheckedAt: checkedAt
  };
}

async function probe(base: string, endpoints: string[]): Promise<Probe> {
  let last: Probe | null = null;
  for (const endpoint of endpoints) {
    const result = await probeSingle(base, endpoint);
    if (result.ok || result.statusCode !== 404) return result;
    last = result;
  }
  return last ?? {
    ok: false,
    statusCode: null,
    data: null,
    endpoint: endpoints[0] ?? "",
    errorMessage: "NO_ENDPOINT_CONFIGURED"
  };
}

async function probeSingle(base: string, endpoint: string): Promise<Probe> {
  try {
    const response = await fetch(`${base}${endpoint}`, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(10000) });
    const text = await response.text();
    return { ok: response.ok, statusCode: response.status, endpoint, data: sanitizeOperationalData(unwrapEnvelope(parseJson(text))), errorMessage: response.ok ? "" : `HTTP ${response.status} ${endpoint}` };
  } catch (error) {
    return { ok: false, statusCode: null, endpoint, data: null, errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

function check(key: string, label: string, status: ReadinessStatus, detail: string, checkedAt: string): PlanReadinessCheck {
  return { key, label, status, detail, checkedAt };
}

function endpointStatus(probeResult: EndpointProbe): ReadinessStatus {
  if (!probeResult) return "warning";
  if (probeResult.skipped) return "skipped";
  if (probeResult.ok) return "success";
  if (probeResult.statusCode === 404) return "warning";
  return "warning";
}

function endpointDetail(probeResult: EndpointProbe) {
  if (!probeResult) return "not reported";
  if (probeResult.ok) return `reachable ${probeResult.endpoint}`;
  return probeResult.errorMessage || "not reachable";
}

function statusFromBoolean(value: boolean | null): ReadinessStatus {
  if (value === true) return "success";
  if (value === false) return "error";
  return "warning";
}

function readinessStatusFromData(data: Record<string, unknown>, keys: string[]) {
  const explicit = firstStatus(readPath(data, ["status"]), readPath(data, ["readinessStatus"]));
  if (explicit) return explicit;
  return statusFromBoolean(firstBoolean(...keys.map((key) => readPath(data, [key]))));
}

function businessUnavailableStatus(releaseData: Record<string, unknown>, contractData: Record<string, unknown>): ReadinessStatus {
  const status = firstString(
    readPath(releaseData, ["businessPlanStatus"]),
    readPath(releaseData, ["business", "status"]),
    readPath(releaseData, ["plans", "business", "status"]),
    readPath(contractData, ["businessPlanStatus"]),
    readPath(contractData, ["plans", "business", "status"])
  );
  const purchasable = firstBoolean(
    readPath(releaseData, ["businessPurchasable"]),
    readPath(releaseData, ["businessPlanPurchasable"]),
    readPath(releaseData, ["business", "purchasable"]),
    readPath(releaseData, ["plans", "business", "purchasable"]),
    readPath(contractData, ["businessPurchasable"]),
    readPath(contractData, ["plans", "business", "purchasable"])
  );
  if (["preparing", "unavailable", "not_purchasable", "disabled"].includes(status) || purchasable === false) return "success";
  if (purchasable === true || status === "ready") return "error";
  return "warning";
}

function databaseStatus(data: Record<string, unknown>): ReadinessStatus {
  const explicit = firstBoolean(readPath(data, ["d1Reachable"]), readPath(data, ["dbReachable"]), readPath(data, ["databaseReachable"]));
  if (explicit === true) return "success";
  if (explicit === false) return "error";
  return readinessStatusFromData(data, ["d1Configured", "dbConfigured", "databaseReady"]);
}

function deployStatus(data: Record<string, unknown>, version: Probe): ReadinessStatus {
  const deployState = firstString(readPath(data, ["deployStatus"]), readPath(data, ["latestDeployStatus"]));
  if (["ready", "success", "deployed"].includes(deployState)) return "success";
  if (["failed", "error", "blocked"].includes(deployState)) return "error";
  return version.ok ? "success" : "warning";
}

function errorCategories(...sources: Record<string, unknown>[]) {
  const categories = new Set<string>();
  for (const source of sources) {
    for (const item of asStringArray(readPath(source, ["primaryErrorCategories"]))) categories.add(item);
    for (const item of asStringArray(readPath(source, ["errorCategories"]))) categories.add(item);
    const errorCode = firstString(readPath(source, ["errorCode"]), readPath(source, ["lastErrorCode"]));
    if (errorCode) categories.add(errorCode);
  }
  return Array.from(categories).filter((item) => !isForbiddenFieldName(item)).slice(0, 8);
}

function statusDetail(status: ReadinessStatus, successDetail: string) {
  if (status === "success") return successDetail;
  if (status === "error") return "explicitly failed";
  if (status === "skipped") return "not configured";
  return "not reported";
}

function formatFailure(result: Probe) {
  if (result.skipped) return "SKIPPED";
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

function firstString(...values: unknown[]) {
  for (const value of values) if (typeof value === "string" && value) return value;
  return "";
}

function firstStatus(...values: unknown[]): ReadinessStatus | null {
  for (const value of values) {
    if (value === "success" || value === "ready" || value === "healthy") return "success";
    if (value === "warning" || value === "in_progress" || value === "preparing" || value === "unavailable") return "warning";
    if (value === "error" || value === "blocked" || value === "failed") return "error";
    if (value === "skipped" || value === "not_applicable") return "skipped";
  }
  return null;
}

function firstBoolean(...values: unknown[]) {
  for (const value of values) if (typeof value === "boolean") return value;
  return null;
}

function readPath(source: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = source;
  for (const segment of path) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function statusEquals(value: unknown, expected: string) {
  if (typeof value !== "string") return null;
  return value === expected;
}

function combinedStatus(endpoint: ReadinessStatus, contractSignal: ReadinessStatus): ReadinessStatus {
  if (endpoint === "skipped") return "skipped";
  if (endpoint === "warning" && contractSignal !== "error") return "warning";
  if (contractSignal === "error") return "error";
  if (contractSignal === "success") return "success";
  return endpoint;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function labelForKey(key: string) {
  return key.replace(/-/g, " ");
}

function sanitizeOperationalData(value: Record<string, unknown> | null) {
  if (!value) return null;
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (isForbiddenFieldName(key)) continue;
    if (typeof child === "object" && child !== null && !Array.isArray(child)) {
      output[key] = sanitizeOperationalData(child as Record<string, unknown>);
    } else if (Array.isArray(child)) {
      output[key] = child.filter((item) => typeof item === "string" || typeof item === "number" || typeof item === "boolean");
    } else {
      output[key] = child;
    }
  }
  return output;
}

function isForbiddenFieldName(value: string) {
  const normalized = value.toLowerCase();
  return [
    "paymentdetail",
    "stripesecret",
    "apikey",
    "api_key",
    "conversationtext",
    "conversationbody",
    "appraisaltext",
    "appraisalbody",
    "messagetext",
    "messagebody",
    "secretprompt",
    "rawwebhookpayload"
  ].some((blocked) => normalized.includes(blocked));
}
