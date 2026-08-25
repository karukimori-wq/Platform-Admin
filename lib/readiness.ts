import packageJson from "@/package.json";

export const readinessConfig = {
  appName: "platform-admin",
  contractVersion: "0.1.0",
  identityMode: "workspaceId+userId",
  professionalIdRequired: false,
  usesLegacyEventNames: false,
  usesReportTerminology: true,
  canonicalOwnershipChecked: true,
  issues: [] as string[]
};

export function getTimestamp() { return new Date().toISOString(); }
export function getCommitSha() { return process.env.CF_PAGES_COMMIT_SHA ?? process.env.COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? "optional"; }
export function getAppVersion() { return packageJson.version; }
