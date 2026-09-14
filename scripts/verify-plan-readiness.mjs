import fs from "node:fs";

const filePath = process.argv[2];
if (!filePath) throw new Error("Usage: node scripts/verify-plan-readiness.mjs <payload.json>");
if (!fs.existsSync(filePath)) throw new Error(`Plan readiness payload file is missing: ${filePath}`);

const text = fs.readFileSync(filePath, "utf8").trim();
if (!text) throw new Error(`Plan readiness payload is empty: ${filePath}`);

let payload;
try {
  payload = JSON.parse(text);
} catch (error) {
  const preview = text.slice(0, 160);
  throw new Error(`Plan readiness payload is not valid JSON: ${preview}`, { cause: error });
}

const apps = payload.data;
if (!Array.isArray(apps)) throw new Error("Plan readiness payload missing data array");

const requiredApps = new Set(["numeria-studio", "velvet", "ai-platform-core", "feedback-hub", "growth-engine"]);
const requiredChecks = new Set([
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
]);
const allowedStatuses = new Set(["success", "warning", "error", "skipped"]);
const forbiddenKeys = [
  "paymentDetails",
  "stripeSecret",
  "apiKey",
  "api_key",
  "conversationText",
  "conversationBody",
  "appraisalText",
  "appraisalBody",
  "messageText",
  "messageBody",
  "secretPrompt",
  "rawWebhookPayload"
];

for (const requiredApp of requiredApps) {
  const app = apps.find((item) => item?.appName === requiredApp);
  if (!app) throw new Error(`${requiredApp} plan readiness missing`);
  if (!app.appId) throw new Error(`${requiredApp} appId missing`);
  if (!allowedStatuses.has(app.productionStatus)) throw new Error(`${requiredApp} productionStatus is invalid`);
  if (!Array.isArray(app.checks)) throw new Error(`${requiredApp} checks missing`);

  for (const requiredCheck of requiredChecks) {
    const check = app.checks.find((item) => item?.key === requiredCheck);
    if (!check) throw new Error(`${requiredApp} ${requiredCheck} check missing`);
    if (!allowedStatuses.has(check.status)) throw new Error(`${requiredApp} ${requiredCheck} status is invalid`);
  }
}

const keyPaths = [];
collectKeyPaths(payload, [], keyPaths);
for (const keyPath of keyPaths) {
  const lower = keyPath.toLowerCase();
  for (const forbiddenKey of forbiddenKeys) {
    if (lower.includes(forbiddenKey.toLowerCase())) throw new Error(`Forbidden sensitive field in plan readiness payload: ${keyPath}`);
  }
}

function collectKeyPaths(value, path, output) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectKeyPaths(item, [...path, String(index)], output));
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];
    output.push(nextPath.join("."));
    collectKeyPaths(child, nextPath, output);
  }
}
