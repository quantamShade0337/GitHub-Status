import { cache } from "./cache";

export class RateLimitError extends Error {
  constructor(readonly retryAfterSec: number) {
    super("Too many requests");
    this.name = "RateLimitError";
  }
}

/** Extract a best-effort client IP from proxy headers (Railway/Vercel set these). */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}

/**
 * Fixed-window per-key rate limit, backed by the shared cache (in-memory or Redis).
 * Returns whether the request is allowed plus metadata. Fails open if the cache errors.
 */
export async function rateLimit(
  key: string,
  { limit, windowSec }: { limit: number; windowSec: number },
): Promise<{ ok: boolean; remaining: number; retryAfterSec: number }> {
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const cacheKey = `rl:${key}:${bucket}`;
  try {
    const count = await cache.incr(cacheKey, windowSec);
    const remaining = Math.max(0, limit - count);
    const retryAfterSec = windowSec - (Math.floor(Date.now() / 1000) % windowSec);
    return { ok: count <= limit, remaining, retryAfterSec };
  } catch {
    return { ok: true, remaining: limit, retryAfterSec: 0 };
  }
}

/** Throws RateLimitError when the limit is exceeded. For use in pages/services. */
export async function enforceRateLimit(
  key: string,
  opts: { limit: number; windowSec: number },
): Promise<void> {
  const result = await rateLimit(key, opts);
  if (!result.ok) throw new RateLimitError(result.retryAfterSec);
}
