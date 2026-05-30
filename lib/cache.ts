/**
 * Cache abstraction used across the GitHub services.
 *
 * - Default: an in-process Map with TTL + LRU-ish eviction. Zero dependencies,
 *   perfect for local dev and single-instance deployments.
 * - If `REDIS_URL` is set, it transparently uses Redis instead (so multiple
 *   serverless instances share a cache). `ioredis` is an *optional* dependency,
 *   loaded lazily via a non-literal import so the app builds and runs without it.
 *
 * All values are JSON-serialised, so cache backends stay interchangeable.
 */

const DEFAULT_TTL_SECONDS = 60 * 60 * 6; // 6 hours
const MAX_MEMORY_ENTRIES = 500;

interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  /** Atomically increment a counter, setting its TTL on first creation. Used for rate limiting. */
  incr(key: string, ttlSeconds: number): Promise<number>;
}

class MemoryCache implements CacheBackend {
  private store = new Map<string, { value: string; expiresAt: number }>();
  private counters = new Map<string, { count: number; expiresAt: number }>();

  async incr(key: string, ttlSeconds: number): Promise<number> {
    const now = Date.now();
    const existing = this.counters.get(key);
    if (!existing || existing.expiresAt < now) {
      this.counters.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 });
      return 1;
    }
    existing.count += 1;
    return existing.count;
  }

  async get<T>(key: string): Promise<T | null> {
    const hit = this.store.get(key);
    if (!hit) return null;
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    // refresh recency for naive LRU
    this.store.delete(key);
    this.store.set(key, hit);
    return JSON.parse(hit.value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    if (this.store.size >= MAX_MEMORY_ENTRIES) {
      // evict oldest (first inserted) entry
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, {
      value: JSON.stringify(value),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

class RedisCache implements CacheBackend {
  // typed loosely because ioredis is an optional, lazily-loaded dependency
  private clientPromise: Promise<any>;

  constructor(url: string) {
    // ioredis is only imported (and connected) when REDIS_URL is actually set.
    this.clientPromise = import("ioredis")
      .then((mod) => {
        const Redis = mod.default ?? mod;
        return new Redis(url);
      })
      .catch((err) => {
        console.warn(
          "[cache] REDIS_URL is set but Redis could not be initialised; " +
            "falling back to in-memory cache.",
          err?.message,
        );
        return null;
      });
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.clientPromise;
    if (!client) return null;
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    const client = await this.clientPromise;
    if (!client) return;
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async incr(key: string, ttlSeconds: number): Promise<number> {
    const client = await this.clientPromise;
    if (!client) return 1; // no Redis available → don't block requests
    const count: number = await client.incr(key);
    if (count === 1) await client.expire(key, ttlSeconds);
    return count;
  }
}

// Singleton across hot reloads.
const globalForCache = globalThis as unknown as { cache?: CacheBackend };

export const cache: CacheBackend =
  globalForCache.cache ??
  (process.env.REDIS_URL ? new RedisCache(process.env.REDIS_URL) : new MemoryCache());

if (process.env.NODE_ENV !== "production") {
  globalForCache.cache = cache;
}

/** Wrap an async producer with read-through caching. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  produce: () => Promise<T>,
): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== null) return hit;
  const value = await produce();
  await cache.set(key, value, ttlSeconds);
  return value;
}
