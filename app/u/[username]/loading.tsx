const LOADING_MESSAGES = [
  "Finding public repos…",
  "Reading language DNA…",
  "Counting code footprints…",
  "Checking project polish…",
  "Assigning developer archetype…",
];

export default function Loading() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 accent-glow opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-5xl space-y-8 px-5 py-10">
        {/* header */}
        <div className="flex items-center gap-5">
          <div className="skeleton h-20 w-20 rounded-2xl sm:h-24 sm:w-24" />
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-72" />
            <div className="skeleton h-4 w-56" />
          </div>
        </div>

        {/* loading messages */}
        <div className="card flex items-center gap-3 p-4">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-2">
            {LOADING_MESSAGES.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* archetype hero */}
        <div className="skeleton h-52 w-full rounded-2xl" />

        {/* stats grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>

        {/* language + scores */}
        <div className="skeleton h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
