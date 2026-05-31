import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ArchetypeIcon } from "@/components/ArchetypeIcon";
import { getRecentScans } from "@/lib/store";
import { ARCHETYPES } from "@/lib/analysis/archetypes";

export const dynamic = "force-dynamic";

const EXAMPLES = ["torvalds", "gaearon", "sindresorhus", "antfu", "yyx990803"];

const FEATURES = [
  {
    title: "Real GitHub stats",
    body: "Repos, stars, languages, estimated code footprint, and commit activity, all from public data.",
  },
  {
    title: "A developer archetype",
    body: "Not just numbers. We read your profile and assign you one of ten developer character types.",
  },
  {
    title: "Language DNA",
    body: "Byte-level language breakdown across all your repos, not just each repo's primary language.",
  },
  {
    title: "Six skill scores",
    body: "Output, consistency, depth, diversity, polish, and experimentation, each scored 0 to 100.",
  },
  {
    title: "Compare with friends",
    body: "Put two profiles side by side and see who ships more, who goes deeper, who experiments more.",
  },
  {
    title: "A shareable card",
    body: "Generate a clean card built for X, GitHub, and LinkedIn. Screenshot-ready by design.",
  },
];

export default async function HomePage() {
  const recent = await getRecentScans(6);
  const allArchetypes = Object.values(ARCHETYPES);
  const sampleArchetypes = allArchetypes.slice(0, 8);
  const archetypeCount = allArchetypes.length;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-20 text-center sm:pt-28">
          <p className="eyebrow">GitHub, read like a character sheet</p>

          <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Turn your GitHub into a{" "}
            <span className="text-accent">developer character sheet</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            See your repos, languages, commits, code footprint, and developer archetype in one
            shareable profile. No sign-in required.
          </p>

          <div className="mx-auto mt-9 max-w-xl">
            <SearchBar autoFocus />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-2">
              <span>Try</span>
              {EXAMPLES.map((u) => (
                <Link
                  key={u}
                  href={`/u/${u}`}
                  className="mono rounded-md border border-line px-2 py-0.5 transition-colors hover:border-line-strong hover:text-foreground"
                >
                  @{u}
                </Link>
              ))}
            </div>
          </div>

          {recent.length > 0 && (
            <div className="mt-12">
              <p className="eyebrow">Recently scanned</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
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
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">What you get</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Not just stats, your developer identity
          </h2>
          <p className="mt-3 text-muted">
            A normal profile shows repos and a contribution graph. GitPersona answers the harder
            question: what kind of developer are you?
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 border-t border-line sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="flex gap-4 border-b border-line py-6 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pr-8 sm:[&:nth-child(even)]:pl-8"
            >
              <span className="mono shrink-0 text-sm text-muted-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Archetypes teaser */}
      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="card p-6 sm:p-10">
          <p className="eyebrow">The cast</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
            {archetypeCount} developer archetypes
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Every profile is read like an RPG character. Broad types like the fast-moving Prototype
            Alchemist or patient Open Source Monk, plus language-specific reads: a TypeScript Native,
            a Pythonista, a Rustacean, a Markup Artisan.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {sampleArchetypes.map((a) => (
              <span
                key={a.key}
                className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm"
              >
                <ArchetypeIcon archetype={a} className="h-4 w-4" />
                {a.name}
              </span>
            ))}
            <span className="flex items-center rounded-full border border-line px-3 py-1.5 text-sm text-muted-2">
              + more
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
