import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Persistence is OPTIONAL. The app is fully functional with no database — scans
 * run live and the cache layer handles speed. A database only persists scan
 * summaries across restarts (powering "recently scanned" and instant repeats).
 *
 * Enabled when `DATABASE_URL` is set (and `PERSISTENCE_DISABLED` is not "1").
 * Local dev + a Railway volume both use SQLite (`file:` URLs).
 */
export function persistenceEnabled(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  if (process.env.PERSISTENCE_DISABLED === "1") return false;
  return true;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null;
};

function createClient(): PrismaClient | null {
  if (!persistenceEnabled()) return null;
  try {
    const url = process.env.DATABASE_URL!.trim();
    if (url.startsWith("file:")) ensureSqliteDir(url);
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (err) {
    console.error("[db] failed to initialise persistence; running without it.", err);
    return null;
  }
}

/** Ensure the parent directory of a `file:` SQLite DB exists (e.g. a mounted volume). */
function ensureSqliteDir(url: string): void {
  const path = url.replace(/^file:/, "").split("?")[0];
  if (!path || path === ":memory:") return;
  const dir = dirname(path);
  if (dir && dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/** Returns the Prisma client, or `null` when persistence is disabled/unavailable. */
export function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prisma !== undefined) return globalForPrisma.prisma;
  const client = createClient();
  // Reuse across hot reloads / module evaluations.
  globalForPrisma.prisma = client;
  return client;
}
