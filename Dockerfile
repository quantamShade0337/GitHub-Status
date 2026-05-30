# ── GitPersona production image ──────────────────────────────────────────────
# Works on Railway, Fly, Render, or any container host. Persistence is optional:
# leave DATABASE_URL unset to run on live scans + cache only, or point it at a
# SQLite file on a mounted volume (e.g. DATABASE_URL="file:/data/gitpersona.db").

FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# --- deps: install with native build tools (better-sqlite3) ---
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# `npm ci` runs postinstall (prisma generate), which needs the schema (copied above).
RUN npm ci

# --- builder: compile the Next app ---
FROM deps AS builder
COPY . .
RUN npm run build

# --- runner: slim runtime ---
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV PORT=3000
CMD ["node", "scripts/start.mjs"]
