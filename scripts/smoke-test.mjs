const baseUrl = process.env.PLATFORM_ADMIN_BASE_URL ?? "http://127.0.0.1:3000";
const username = process.env.PLATFORM_ADMIN_USERNAME ?? "admin";
const token = process.env.PLATFORM_ADMIN_API_TOKEN ?? "";

const endpoints = [
  "/health",
  "/version",
  "/contracts/status",
  "/api/status",
  "/api/apps",
  "/api/workspaces",
  "/api/logs",
  "/api/logs?status=failed",
  "/api/contracts",
  "/api/ingest/app-connection",
  "/api/ingest/log",
  "/api/health/growth-engine",
  "/api/health/numeria-studio",
  "/api/health/sns-planner",
  "/api/health/ai-platform-core"
];

const headers = token
  ? {
      authorization: `Basic ${Buffer.from(`${username}:${token}`).toString("base64")}`
    }
  : undefined;

let failed = false;

for (const endpoint of endpoints) {
  const url = new URL(endpoint, baseUrl);
  const options = endpoint === "/api/ingest/app-connection"
    ? {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({
          appName: "Growth Engine",
          repositoryUrl: "https://github.com/karukimori-wq/growth-engine",
          status: "healthy",
          contractVersion: "v1",
          healthCheckUrl: "/api/health/growth-engine",
          healthCheckStatus: "ok"
        })
      }
    : endpoint === "/api/ingest/log"
      ? {
          method: "POST",
          headers: { ...headers, "content-type": "application/json" },
          body: JSON.stringify({
            workspaceId: "wks_smoke_001",
            appName: "Growth Engine",
            type: "event",
            status: "success",
            message: "smoke test event",
            payloadRef: "smoke"
          })
        }
      : { headers };

  try {
    const response = await fetch(url, options);
    const ok = response.ok || response.status === 503;
    const marker = ok ? "OK" : "FAIL";

    console.log(`${marker} ${response.status} ${endpoint}`);

    if (!ok) failed = true;
  } catch (error) {
    failed = true;
    console.log(`FAIL 000 ${endpoint}`);
    console.log(error instanceof Error ? error.message : String(error));
  }
}

if (failed) {
  process.exitCode = 1;
}
