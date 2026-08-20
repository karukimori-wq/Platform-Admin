export type SnapshotDriver = "mock" | "supabase" | "d1";

export function getSnapshotDriver(): SnapshotDriver {
  const configured = process.env.SNAPSHOT_DRIVER?.trim().toLowerCase();

  if (configured === "d1") return "d1";
  if (configured === "supabase") return "supabase";
  if (configured === "mock") return "mock";

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "supabase";
  }

  return "mock";
}

export function snapshotDriverRequiresAdminAccess() {
  return getSnapshotDriver() !== "mock";
}
