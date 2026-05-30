import type { NextRequest } from "next/server";
import { getScan } from "@/lib/scanService";
import { errorResponse } from "@/lib/apiError";
import { clientIp, enforceRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const u1 = req.nextUrl.searchParams.get("u1");
  const u2 = req.nextUrl.searchParams.get("u2");
  if (!u1 || !u2) {
    return Response.json(
      { error: "Provide two usernames: ?u1=…&u2=…", code: "invalid_username" },
      { status: 400 },
    );
  }
  try {
    await enforceRateLimit(`compare:${clientIp(req.headers)}`, { limit: 10, windowSec: 60 });
    const [a, b] = await Promise.all([getScan(u1), getScan(u2)]);
    return Response.json(
      { a, b },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    return errorResponse(err);
  }
}
