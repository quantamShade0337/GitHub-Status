import Link from "next/link";
import { Sparkles, Languages, Boxes, Trophy, GitCompare, Gauge } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { getRecentScans } from "@/lib/store";
import { ARCHETYPES } from "@/lib/analysis/archetypes";

export const dynamic = "force-dynamic";

const EXAMPLES = ["torvalds", "gaearon", "sindresorhus", "antfu", "yyx990803"];

const FEATURES = [
  {
    icon: Gauge,
    title: "Real GitHub stats",
    body: "Repos, stars, languages, estimated code footprint, and commit activity — all from public data.",
  },
  {
    icon: Sparkles,
    title: "A developer archetype",
    body: "Not just numbers. We read your profile and assign you one of ten developer character types.",
  },
  {
    icon: Languages,
    title: "Language DNA",
    body: "Byte-level language breakdown across all your repos, not just each repo's primary language.",
  },
  {
    icon: Boxes,
    title: "Six skill scores",
    body: "Output, consistency, depth, diversity, polish, and experimentation — scored 0–100.",
  },
  {
    icon: GitCompare,
    title: "Compare with friends",
    body: "Put two profiles side by side and see who ships more, who goes deeper, who's more experimental.",
  },
  {
    icon: Trophy,
    title: "A shareable card",
    body: "Generate a polished card built for X, GitHub, and LinkedIn. Screenshot-ready by design.",
  },
];

export default async function HomePage() {
  const recent = await getRecentScans(6);
  const sampleArchetypes = Object.values(ARCHETYPES).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] accent-glow" aria-hidden />

        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            GitHub Wrapped meets an RPG stat sheet
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Turn your GitHub into a{" "}
            <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
              developer character sheet
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted sm:text-lg">
            See your repos, languages, commits, code footprint, and developer archetype in one
            beautiful, shareable profile. No sign-in required.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar autoFocus />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-2">
              <span>Try</span>
              {EXAMPLES.map((u) => (
                <Link
                  key={u}
                  href={`/u/${u}`}
                  className="mono rounded-md border border-line px-2 py-0.5 transition hover:border-line-strong hover:text-foreground"
                >
                  @{u}
                </Link>
              ))}
            </div>
          </div>

          {recent.length > 0 && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-wide text-muted-2">Recently scanned</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {recent.map((s) => (
                  <Link
                    key={s.username}
                    href={`/u/${s.username}`}
                    className="card card-hover flex items-center gap-2 px-2.5 py-1.5 text-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {s.avatarUrl && (
                      <img src={s.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                    )}
                    <span className="mono">{s.username}</span>
                    <span className="text-xs text-muted-2">{s.archetype}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Not just stats — your developer identity
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            A normal GitHub profile shows repos and a contribution graph. GitPersona answers the
            harder question: what kind of developer are you?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 ring-1 ring-accent/25">
                <f.icon className="h-[18px] w-[18px] text-accent" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Archetypes teaser */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="card relative overflow-hidden p-6 sm:p-10">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" aria-hidden />
          <div className="relative">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Ten developer archetypes
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Every profile is read like an RPG character. You might be a fast-moving Prototype
              Alchemist, a patient Open Source Monk, or a close-to-the-metal Systems Goblin.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {sampleArchetypes.map((a) => (
                <span
                  key={a.key}
                  className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm"
                  style={{ boxShadow: `inset 0 0 0 1px ${a.color}22` }}
                >
                  <span>{a.emoji}</span>
                  <span>{a.name}</span>
                </span>
              ))}
              <span className="flex items-center rounded-full border border-line px-3 py-1.5 text-sm text-muted-2">
                + more
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
