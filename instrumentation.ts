// Runs once when the server starts (Next.js instrumentation hook).
// Logs a concise config summary + actionable warnings — no secrets.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const hasToken = Boolean(process.env.GITHUB_TOKEN?.trim());
  const dbUrl = process.env.DATABASE_URL?.trim();
  const persistence = Boolean(dbUrl) && process.env.PERSISTENCE_DISABLED !== "1";
  const redis = Boolean(process.env.REDIS_URL?.trim());

  console.log(
    `[gitpersona] config — token:${hasToken ? "yes" : "no"} · ` +
      `persistence:${persistence ? "on" : "off"} · cache:${redis ? "redis" : "memory"}`,
  );

  if (!hasToken) {
    console.warn(
      "[gitpersona] No GITHUB_TOKEN set — limited to 60 GitHub requests/hour and heuristic commit counts. " +
        "Set GITHUB_TOKEN to raise the limit to 5,000/hr.",
    );
  }
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_BASE_URL) {
    console.warn(
      "[gitpersona] NEXT_PUBLIC_BASE_URL is not set — share-card and OG links will fall back to localhost.",
    );
  }
}
