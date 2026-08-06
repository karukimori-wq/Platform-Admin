import type { ConnectionTestAppName, ConnectionTestLog, ConnectionTestResult } from "./types";

type Endpoint = "/health" | "/version" | "/contracts/status";

type TestApp = {
  appName: ConnectionTestAppName;
  baseUrl: string;
};

type FetchResult = {
  statusCode: number | null;
  ok: boolean;
  data: Record<string, unknown> | null;
  errorMessage: string;
};

export const connectionTestApps: TestApp[] = [
  { appName: "platform-admin", baseUrl: "https://platform-admin-preview.illusionddt.chatgpt.site" },
  { appName: "growth-engine", baseUrl: "https://growth-engine-api-preview.illusionddt.chatgpt.site" },
  { appName: "ai-platform-core", baseUrl: "https://ai-platform-core-preview.illusionddt.chatgpt.site" },
  { appName: "sns-planner", baseUrl: "https://sns-planner.illusionddt.chatgpt.site" },
  { appName: "numeria-studio", baseUrl: "https://numeria-studio.illusionddt.chatgpt.site" }
];

export async function runConnectionTests() {
  const checkedAt = new Date().toISOString();
  const results = await Promise.all(connectionTestApps.map((app) => testApp(app, checkedAt)));
  const logs = results.flatMap((result) => result.logs);

  return {
    results: results.map((result) => result.result),
    logs,
    checkedAt
  };
}

async function testApp(app: TestApp, checkedAt: string): Promise<{ result: ConnectionTestResult; logs: ConnectionTestLog[] }> {
  const [health, version, contract] = await Promise.all([
    fetchEndpoint(app.baseUrl, "/health"),
    fetchEndpoint(app.baseUrl, "/version"),
    fetchEndpoint(app.baseUrl, "/contracts/status")
  ]);

  const logs: ConnectionTestLog[] = [];
  addFailureLog(logs, app.appName, "/health", health, checkedAt);
  addFailureLog(logs, app.appName, "/version", version, checkedAt);
  addFailureLog(logs, app.appName, "/contracts/status", contract, checkedAt);

  const issues = asStringArray(contract.data?.issues);
  const validationIssues = validateContract(contract.data);
  const lastError = [health, version, contract]
    .filter((item) => !item.ok)
    .map((item) => item.errorMessage)
    .concat(validationIssues)
    .filter(Boolean)
    .join(" / ");

  return {
    result: {
      appName: app.appName,
      baseUrl: app.baseUrl,
      healthStatus: health.ok ? "200 OK" : formatFailure(health),
      appVersion: asString(version.data?.appVersion),
      contractVersion: asString(contract.data?.contractVersion),
      contractStatus: asString(contract.data?.status),
      identityMode: asString(contract.data?.identityMode),
      professionalIdRequired: asBoolean(contract.data?.professionalIdRequired),
      usesLegacyEventNames: asBoolean(contract.data?.usesLegacyEventNames),
      usesReportTerminology: asBoolean(contract.data?.usesReportTerminology),
      canonicalOwnershipChecked: asBoolean(contract.data?.canonicalOwnershipChecked),
      issues: [...issues, ...validationIssues],
      lastCheckedAt: checkedAt,
      lastError
    },
    logs
  };
}

async function fetchEndpoint(baseUrl: string, endpoint: Endpoint): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });
    const text = await response.text();
    const data = parseJson(text);

    return {
      statusCode: response.status,
      ok: response.ok,
      data,
      errorMessage: response.ok ? "" : `HTTP ${response.status} ${endpoint}`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      statusCode: null,
      ok: false,
      data: null,
      errorMessage: `${endpoint}: ${message}`
    };
  } finally {
    clearTimeout(timeout);
  }
}

function addFailureLog(
  logs: ConnectionTestLog[],
  appName: ConnectionTestAppName,
  endpoint: Endpoint,
  result: FetchResult,
  checkedAt: string
) {
  if (result.ok) return;

  logs.push({
    appName,
    endpoint,
    statusCode: result.statusCode,
    errorMessage: result.errorMessage,
    checkedAt
  });
}

function validateContract(data: Record<string, unknown> | null) {
  const issues: string[] = [];

  if (!data) {
    issues.push("contracts/status returned no JSON payload");
    return issues;
  }

  if (data.contractVersion !== "0.1.0") issues.push("contractVersion is not 0.1.0");
  if (data.identityMode !== "workspaceId+userId") issues.push("identityMode is not workspaceId+userId");
  if (data.professionalIdRequired !== false) issues.push("professionalIdRequired is not false");
  if (data.usesLegacyEventNames !== false) issues.push("usesLegacyEventNames is not false");
  if (data.usesReportTerminology !== true) issues.push("usesReportTerminology is not true");

  return issues;
}

function parseJson(text: string) {
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function formatFailure(result: FetchResult) {
  return result.statusCode ? `${result.statusCode} ERROR` : "FETCH ERROR";
}
