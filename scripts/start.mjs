// Production start script.
// Applies SQLite migrations only when file-based persistence is enabled, then
// starts Next. Works under Railway/Nixpacks and inside the Dockerfile.
import { spawn, spawnSync } from "node:child_process";

const url = (process.env.DATABASE_URL || "").trim();
const persistenceOn = url && process.env.PERSISTENCE_DISABLED !== "1";

if (persistenceOn && url.startsWith("file:")) {
  console.log("[start] applying database migrations…");
  const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
  });
  if (migrate.status !== 0) {
    console.warn("[start] migrations failed — continuing (persistence may be degraded).");
  }
} else {
  console.log(
    persistenceOn
      ? "[start] non-file DATABASE_URL detected; skipping SQLite migrate."
      : "[start] persistence disabled; running on live scans + cache only.",
  );
}

const port = process.env.PORT || "3000";
const child = spawn("npx", ["next", "start", "-p", port], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
