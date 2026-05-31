import { ImageResponse } from "next/og";
import { getScan } from "@/lib/scanService";
import { formatCompact, formatNumber } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// 1200×630 social card. Satori supports flexbox + a subset of CSS only — no grid.
export async function GET(req: Request, ctx: RouteContext<"/api/card/[username]">) {
  const { username } = await ctx.params;

  const limit = await rateLimit(`card:${clientIp(req.headers)}`, { limit: 30, windowSec: 60 });
  if (!limit.ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSec) },
    });
  }

  let scan;
  try {
    scan = await getScan(username);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const { profile, archetype, scores, stats, languages } = scan;
  const accent = archetype.color;
  const host = (process.env.NEXT_PUBLIC_BASE_URL || "gitpersona.app")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const topLangs = languages.slice(0, 3);
  const langStrip = languages.slice(0, 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#08080b",
          color: "#ededf2",
          fontFamily: "sans-serif",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* accent rule keyed to the archetype color */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "8px",
            background: accent,
            display: "flex",
          }}
        />

        {/* header row */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <img
            src={profile.avatarUrl}
            width={108}
            height={108}
            style={{ borderRadius: "24px", border: "1px solid rgba(255,255,255,0.14)" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "40px", fontWeight: 700 }}>
              {profile.name || profile.login}
            </div>
            <div style={{ fontSize: "24px", color: "#9a9aa6", marginTop: "4px" }}>
              {`@${profile.login}`}
            </div>
          </div>
          <div style={{ display: "flex", marginLeft: "auto", alignItems: "center" }}>
            <div style={{ fontSize: "22px", color: "#9a9aa6" }}>GitPersona</div>
          </div>
        </div>

        {/* archetype */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "20px",
              fontSize: "44px",
              fontWeight: 700,
              color: accent,
              background: `${accent}1f`,
              border: `1px solid ${accent}55`,
            }}
          >
            {archetype.name.charAt(0)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "52px", fontWeight: 700, lineHeight: 1.05 }}>
              {archetype.name}
            </div>
            <div style={{ fontSize: "24px", color: accent, marginTop: "8px" }}>
              {archetype.tagline}
            </div>
          </div>
        </div>

        {/* language strip */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "12px",
            borderRadius: "9999px",
            overflow: "hidden",
            marginTop: "44px",
            background: "#16161c",
          }}
        >
          {langStrip.map((l) => (
            <div key={l.name} style={{ width: `${l.percent}%`, background: l.color, display: "flex" }} />
          ))}
        </div>

        {/* stats row */}
        <div style={{ display: "flex", gap: "56px", marginTop: "36px" }}>
          <Stat label="OUTPUT SCORE" value={String(scores.output)} accent={accent} />
          <Stat label="REPOS" value={formatNumber(stats.totalRepos)} />
          <Stat label="EST. LINES" value={formatCompact(stats.estimatedLoc)} />
          <Stat label="STARS" value={formatNumber(stats.totalStars)} />
          <Stat
            label="TOP LANGS"
            value={topLangs.map((l) => l.name).join(" · ") || "—"}
            small
          />
        </div>

        {/* footer line */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: "20px",
            color: "#6b6b78",
          }}
        >
          {`${stats.originalRepos} original repos · ${stats.activeYears} years active · ${host}/u/${profile.login}`}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: string;
  small?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: "16px", color: "#6b6b78", letterSpacing: "1px" }}>{label}</div>
      <div
        style={{
          fontSize: small ? "26px" : "44px",
          fontWeight: 700,
          marginTop: "6px",
          color: accent || "#ededf2",
        }}
      >
        {value}
      </div>
    </div>
  );
}
