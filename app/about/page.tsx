import type { Metadata } from "next";
import Link from "next/link";
import { ARCHETYPES } from "@/lib/analysis/archetypes";
import { SearchBar } from "@/components/SearchBar";
import { ArchetypeIcon } from "@/components/ArchetypeIcon";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How GitPersona calculates stats, why lines of code are estimated, what's excluded, and how developer archetypes work.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

const CONFIDENCE = [
  { level: "High confidence", color: "var(--positive)", items: "repo count, stars, forks, followers, account age" },
  { level: "Medium confidence", color: "var(--warning)", items: "language breakdown, years active" },
  { level: "Estimated", color: "var(--accent)", items: "total commits, total source lines" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Methodology</h1>
      <p className="mt-3 text-muted">
        GitPersona turns public GitHub data into a developer character sheet. Here&apos;s exactly
        how each number is produced — and where it&apos;s an estimate.
      </p>

      <Section title="Data source">
        <p>
          Everything comes from the public GitHub REST and GraphQL APIs: your profile, your public
          repositories, per-repo language byte counts, and (when a token is configured) your
          contribution history. We only ever read public data. No sign-in, no write access.
        </p>
        <p>
          Results are cached so repeat visits are fast and we stay friendly to GitHub&apos;s rate
          limits.
        </p>
      </Section>

      <Section title="Confidence labels">
        <p>Every major stat carries a confidence level, shown right next to it:</p>
        <div className="mt-3 space-y-2">
          {CONFIDENCE.map((c) => (
            <div key={c.level} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
              <p>
                <span className="font-medium text-foreground">{c.level}:</span> {c.items}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Estimated source lines">
        <p>
          Counting lines exactly would require cloning and scanning every repo. Instead we derive an
          estimate from GitHub&apos;s per-language byte counts, which already exclude vendored code,
          lockfiles, generated files, and binaries. We convert bytes to lines using
          per-language density factors and apply a conservative discount.
        </p>
        <p>
          This is labelled <span className="text-accent">estimated current source lines</span> — not
          an exact count of every line you&apos;ve ever written. For large accounts, a subset of
          repositories is measured precisely and the long tail is approximated from repo size.
        </p>
      </Section>

      <Section title="Estimated commits">
        <p>
          With a GitHub token, we sum your commit contributions year by year using GitHub&apos;s own
          contribution accounting (medium confidence). Without a token, GraphQL is unavailable, so we
          fall back to a heuristic based on repository size and age (estimated). Either way the number
          is clearly labelled.
        </p>
      </Section>

      <Section title="The six scores">
        <p>
          Each score is a deterministic 0–100 value computed from your repos, languages, and
          activity, using a bounded saturation curve so prolific accounts don&apos;t trivially max
          out:
        </p>
        <ul className="mt-2 space-y-1.5">
          <li><span className="font-medium text-foreground">Output</span> — how much you&apos;ve built (repos, LOC, commits, popularity).</li>
          <li><span className="font-medium text-foreground">Consistency</span> — how regularly and recently you code.</li>
          <li><span className="font-medium text-foreground">Depth</span> — repo size, maintenance, and commits per project.</li>
          <li><span className="font-medium text-foreground">Diversity</span> — language and project-type variety.</li>
          <li><span className="font-medium text-foreground">Polish</span> — descriptions, topics, licenses, demos, READMEs, stars.</li>
          <li><span className="font-medium text-foreground">Experimentation</span> — new repos per year and breadth of small projects.</li>
        </ul>
      </Section>

      <Section title="How archetypes work">
        <p>
          Your archetype is rules-based and deterministic. We score all {Object.keys(ARCHETYPES).length}{" "}
          archetypes against your profile signals (score dimensions, language categories and shares,
          fork ratio, average stars) and assign the best match. Broad behavioral types coexist with
          language-specific ones, so a profile dominated by a single language reads as that
          specialist. The same profile always produces the same archetype.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.values(ARCHETYPES).map((a) => (
            <span key={a.key} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs">
              <ArchetypeIcon archetype={a} className="h-3.5 w-3.5" />
              {a.name}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Privacy">
        <p>
          Public scans use only public GitHub data. Cached scan summaries can be deleted on request.
          We never expose private repositories, and the project requests no write permissions.
        </p>
      </Section>

      <Section title="Limitations">
        <p>
          GitHub&apos;s API has rate limits, repo size includes git history (so LOC is approximate),
          and contribution data for private work isn&apos;t visible without authorization. Treat the
          estimated numbers as a well-informed approximation, not an audit.
        </p>
      </Section>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="font-medium">Ready to see your own character sheet?</p>
        <div className="mx-auto mt-4 max-w-sm">
          <SearchBar size="md" />
        </div>
        <Link href="/" className="mt-4 inline-block text-sm text-muted-2 hover:text-foreground">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
