import type { NextRequest } from "next/server";
import { getScan } from "@/lib/scanService";
import { errorResponse } from "@/lib/apiError";
import { clientIp, enforceRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/scan/[username]">) {
  try {
    await enforceRateLimit(`scan:${clientIp(req.headers)}`, { limit: 20, windowSec: 60 });
    const { username } = await ctx.params;
    const refresh = req.nextUrl.searchParams.get("refresh") === "1";
    const result = await getScan(username, { refresh });
    return Response.json(result, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
