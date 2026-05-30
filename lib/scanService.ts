import "server-only";
import type { ScanResult } from "./analysis/types";
import { runScan } from "./analysis/scan";
import { getStoredScan, saveScan } from "./store";

/**
 * The single entry point pages and API routes use to obtain a scan.
 * Stored-first (fast, cheap), falling back to a live scan that is then persisted.
 */
export async function getScan(
  username: string,
  { refresh = false }: { refresh?: boolean } = {},
): Promise<ScanResult> {
  if (!refresh) {
    const stored = await getStoredScan(username);
    if (stored) return stored;
  }
  const result = await runScan(username);
  await saveScan(result);
  return result;
}
