import { hasToken } from "@/lib/github/client";
import { persistenceEnabled } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Lightweight health/readiness probe (for Railway, uptime checks, etc.). */
export async function GET() {
  return Response.json(
    {
      status: "ok",
      time: new Date().toISOString(),
      config: {
        githubToken: hasToken(),
        persistence: persistenceEnabled(),
        redis: Boolean(process.env.REDIS_URL),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
