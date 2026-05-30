import { getPrisma } from "./db";
import type { ScanResult, ScanSummary } from "./analysis/types";

/** Persist (upsert) a completed scan: denormalized columns + full JSON payload.
 * No-op when persistence is disabled. */
export async function saveScan(result: ScanResult): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const data = {
    displayName: result.profile.name,
    avatarUrl: result.profile.avatarUrl,
    archetypeKey: result.archetype.key,
    archetype: result.archetype.name,
    tagline: result.archetype.tagline,
    outputScore: result.scores.output,
    topLanguage: result.languages[0]?.name ?? null,
    totalRepos: result.stats.totalRepos,
    estimatedLoc: result.stats.estimatedLoc,
    tokenUsed: result.tokenUsed,
    payload: JSON.stringify(result),
  };
  const username = result.username.toLowerCase();
  try {
    await prisma.scan.upsert({
      where: { username },
      create: { username, ...data },
      update: data,
    });
  } catch (err) {
    // Persistence is best-effort; never fail a scan because the DB hiccuped.
    console.error("[store] failed to save scan", err);
  }
}

/**
 * Load a stored scan if it exists and is fresh enough.
 * @param maxAgeMs how old a stored scan may be before we consider it stale.
 */
export async function getStoredScan(
  username: string,
  maxAgeMs = 1000 * 60 * 60 * 6,
): Promise<ScanResult | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const row = await prisma.scan.findUnique({ where: { username: username.toLowerCase() } });
    if (!row) return null;
    if (Date.now() - row.updatedAt.getTime() > maxAgeMs) return null;
    return JSON.parse(row.payload) as ScanResult;
  } catch (err) {
    console.error("[store] failed to load scan", err);
    return null;
  }
}

/** Most recently scanned profiles, for the landing page / leaderboard. */
export async function getRecentScans(limit = 12): Promise<ScanSummary[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const rows = await prisma.scan.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
    return rows.map(toSummary);
  } catch {
    return [];
  }
}

/** Leaderboard slice ordered by a denormalized score. */
export async function getTopScans(limit = 20): Promise<ScanSummary[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const rows = await prisma.scan.findMany({
      orderBy: { outputScore: "desc" },
      take: limit,
    });
    return rows.map(toSummary);
  } catch {
    return [];
  }
}

function toSummary(row: {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  archetypeKey: string;
  archetype: string;
  tagline: string | null;
  outputScore: number;
  topLanguage: string | null;
  totalRepos: number;
  estimatedLoc: number;
}): ScanSummary {
  return {
    username: row.username,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    archetypeKey: row.archetypeKey,
    archetype: row.archetype,
    tagline: row.tagline,
    outputScore: row.outputScore,
    topLanguage: row.topLanguage,
    totalRepos: row.totalRepos,
    estimatedLoc: row.estimatedLoc,
  };
}
