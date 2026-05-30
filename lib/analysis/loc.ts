import type { LanguageStat } from "./types";
import { DEFAULT_LOC_PER_KB, LOC_PER_KB } from "./languageMeta";

/**
 * Estimate current source lines from aggregated language *bytes*.
 *
 * GitHub's linguist (which produces the language byte counts) already excludes
 * vendored code, lockfiles, generated files, and binaries — so this is a
 * reasonable basis for "estimated current source lines" (PRD §8). We convert
 * bytes→lines per-language using rough density factors and apply a conservative
 * global discount, because part of the byte total is approximated from repo size.
 *
 * Always surfaced in the UI as an *estimate*, never an exact count.
 */
const CONSERVATIVE_DISCOUNT = 0.9;

export function estimateLoc(languages: LanguageStat[]): number {
  let lines = 0;
  for (const lang of languages) {
    const perKb = LOC_PER_KB[lang.name] ?? DEFAULT_LOC_PER_KB;
    const kb = lang.bytes / 1024;
    lines += kb * perKb;
  }
  return Math.round(lines * CONSERVATIVE_DISCOUNT);
}
