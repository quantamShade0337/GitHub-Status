# GitPersona

Turn any public GitHub profile into a beautiful, shareable **developer character sheet** —
stats, language DNA, estimated code footprint, six skill scores, a developer **archetype**, a
rules-based personality summary, side-by-side comparison, and a downloadable share card.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma 7 · Recharts ·
Motion**. No sign-in required — it reads only public GitHub data.

---

## Quick start

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Set up the local database (SQLite, zero external services)
npm run db:migrate

# 3. Configure environment
cp .env.example .env        # then edit .env (see below)

# 4. Run it
npm run dev
```

Open <http://localhost:3000> and scan a username (try `torvalds`, `gaearon`, or your own).

> **Node:** this project targets Node 20+ (developed on Node 24). If you use `nvm`,
> run `nvm use --lts` first.

---

## Getting a GitHub token (recommended)

Everything works **without** a token, but GitHub's unauthenticated API is limited to **60
requests/hour per IP** — enough to demo, but you'll hit the wall scanning large accounts. A token
raises this to **5,000 requests/hour** and unlocks contribution-accurate commit counts (via
GraphQL).

You only need a **classic token with no scopes** for public data:

1. Go to <https://github.com/settings/tokens> → **Generate new token** → **Generate new token (classic)**.
2. Give it a name like `gitpersona`, set an expiration.
3. **Leave every scope unchecked** (public data needs no scopes). If you later want private-repo
   support, tick `repo` — but that's not required here.
4. Click **Generate token** and copy the value (starts with `ghp_…`).
5. Paste it into `.env`:

   ```bash
   GITHUB_TOKEN="ghp_your_token_here"
   ```

6. Restart `npm run dev`.

Fine-grained tokens also work — grant **read-only** access to public repositories. Never commit your
token; `.env` is gitignored.

---

## Environment variables

**Everything is optional.** With nothing set, the app runs fully on live scans + an
in-memory cache.

| Variable               | Description                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Optional. `file:…` SQLite path enables persistence. Unset = no DB (live scans + cache).  |
| `PERSISTENCE_DISABLED` | Set to `1` to force-disable persistence even if `DATABASE_URL` is set.                    |
| `GITHUB_TOKEN`         | Recommended. Raises rate limit to 5,000/hr and enables accurate commit counts.           |
| `REDIS_URL`            | Optional. Switches the cache + rate limiter to Redis (only needed for >1 instance).      |
| `NEXT_PUBLIC_BASE_URL` | Set to your deployed URL so share-card / OG links and the sitemap are absolute.          |

See `.env.example` for a fully documented template.

---

## How it works

```
lib/
  github/        Low-level GitHub client (REST + GraphQL, auth, pagination, typed errors)
                 + services: profile, repos, languages, commits, readme detection
  analysis/      Pure logic: types, language metadata, LOC estimate, scoring,
                 archetypes, personality, and the scan orchestrator (runScan)
  cache.ts       In-memory cache (default) → Redis when REDIS_URL is set
  db.ts          Prisma client (SQLite via driver adapter)
  store.ts       Persist / load scan summaries
  scanService.ts getScan(): stored-first, else live scan + persist

app/
  page.tsx                 Landing page
  u/[username]/            Profile report (+ loading skeleton)
  compare/                 Side-by-side comparison
  about/                   Methodology & privacy
  api/scan/[username]/     JSON scan API
  api/compare/             JSON compare API
  api/card/[username]/     1200×630 PNG share card (next/og)

components/    UI: search, stat cards, score ring/bars, charts, repo cards,
              skill tree, share card, archetype hero, compare view, …
```

**Data confidence** is surfaced throughout (per the PRD): repo counts and stars are *high
confidence*; language breakdown is *medium*; commits and lines-of-code are clearly labelled
*estimated*. See the in-app [Methodology page](http://localhost:3000/about) for the full breakdown.

### Estimates, briefly

- **Lines of code** are derived from GitHub's per-language byte counts (which already exclude
  vendored/generated/lockfiles), converted with per-language density factors and a conservative
  discount. Labelled *estimated current source lines* — not a lifetime line count.
- **Commits**: with a token, summed year-by-year from GitHub's contribution history; without one, a
  heuristic from repo size and age.

---

## Deploying to Railway

The app is container-friendly and ships with a `Dockerfile` and a smart start script
(`scripts/start.mjs`) that applies migrations only when persistence is enabled.

**Option A — no persistence (simplest).** Just deploy. Railway auto-detects the Next.js app
(or uses the `Dockerfile`). Set:

- `GITHUB_TOKEN` — your token (recommended)
- `NEXT_PUBLIC_BASE_URL` — your Railway URL, e.g. `https://your-app.up.railway.app`

That's it. Scans run live; the in-memory cache makes repeats fast within each instance.

**Option B — with persistence (SQLite on a volume).** Add a Railway **Volume** mounted at
`/data`, then set:

- `DATABASE_URL="file:/data/gitpersona.db"`

The start script runs `prisma migrate deploy` against the volume on boot. "Recently scanned"
and instant repeat-loads now survive restarts.

**Scaling past one instance?** Add a Railway **Redis** plugin and set `REDIS_URL` so the cache
and rate limiter are shared. (SQLite is single-node; for multi-instance persistence, point
`DATABASE_URL` at Postgres and swap the adapter in `lib/db.ts` to `@prisma/adapter-pg`.)

### Deploy elsewhere

Any container host works: `docker build -t gitpersona . && docker run -p 3000:3000 --env-file .env gitpersona`.
The image installs native deps, builds, and runs the same start script.

## What's production-hardened

- **Optional persistence** — runs with zero database; graceful no-op when unconfigured.
- **Per-IP rate limiting** on every scan surface (pages + APIs), backed by the cache/Redis.
- **Request timeouts** on all GitHub calls (no hung scans).
- **Security headers** — CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, etc. (`next.config.ts`).
- **Cache-Control** on the share card (CDN-cacheable) and scan APIs.
- **Error boundaries** (`error.tsx`, `global-error.tsx`, `not-found.tsx`) + friendly in-app error states.
- **Health probe** at `/api/health`; `robots.ts` + dynamic `sitemap.ts`; OG images for the site and every profile.
- **Boot-time config check** logging token/persistence/cache status and warnings.

---

## Scripts

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start the dev server                  |
| `npm run build`      | Production build                      |
| `npm run start`      | Run the production build              |
| `npm run db:migrate` | Create/apply Prisma migrations        |
| `npm run db:generate`| Regenerate the Prisma client          |
| `npm run lint`       | ESLint                                |

---

Not affiliated with GitHub. Uses only public GitHub data.
