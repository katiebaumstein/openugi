# OpenUGI A vs B — Side-by-side Comparison

Two complete implementations of the same leaderboard, live for you to pick from:

| | Version A | Version B |
|---|---|---|
| URL | https://a.openugi.com | https://b.openugi.com |
| Stack | Vanilla JS + Express + Nginx | Next.js 14 + Tailwind + shadcn + Framer Motion |
| Approach | Targeted refresh of the original | Full modern rewrite |

Both read the **same data**: a shared hourly-cron pipeline at `/var/www/openugi-shared/` → SQLite time series + JSON snapshot + gzipped CSV archive, all preserved forever.

---

## Hard numbers

### Source code size (excluding node_modules, build output)

| | Version A | Version B |
|---|---|---|
| Lines of code | **2,460** | **1,669** |
| Languages | HTML + vanilla JS + CSS | TS + TSX + JSON + CSS |
| Frontend files | 5 (html/js/css + translations) | 13 components + 3 locale files + 6 shadcn primitives |
| Backend | 102 lines Express | Next.js Server Components + 3 API routes |
| Component library | none | 7 shadcn primitives (button/card/input/select/switch/tooltip/badge) |

Version B has ~33% fewer lines overall, despite doing more (typed throughout, componentized, richer animations, proper i18n).

### Runtime footprint on webhost

| | Version A | Version B |
|---|---|---|
| Disk (deployed) | 1.9 MB | 1.6 MB `.next/static` + `node_modules` |
| PM2 memory (idle) | 19.8 MB | 14.5 MB |
| PM2 memory cap | 128 MB | 256 MB |
| Startup time | ~100 ms (Express) | ~2 s (Next.js cold) |
| API reads JSON | cached in memory, mtime-invalidated | cached in memory, mtime-invalidated |

### First-page-load bytes over the wire (gzipped)

| | Version A | Version B |
|---|---|---|
| Initial HTML | 9 KB | 1.8 MB (SSR'd with all 1175 rows inline) |
| JS on critical path | 26 KB (`script.js` + `translations.js`) | ~1 MB across 9 chunks |
| CSS | 29 KB | inlined into HTML (Tailwind JIT) |
| Images needed for first paint | logo (362 KB WebP) + hero (200 KB) | same |
| **Time to interactive** | data fetch after DOMContentLoaded | **data already inlined — table renders immediately** |

Version A sends less JS but the table is empty until the `/api/leaderboard` roundtrip completes. Version B ships more JS but the table is pre-rendered on the server and interactive as soon as hydration finishes — no empty state.

### API latency (3 samples, measured from macOS)

| | Version A | Version B |
|---|---|---|
| `/api/leaderboard` | 0.72s / 1.11s / 0.74s | 0.78s / 0.74s / 0.75s |

Effectively identical — both read the same in-memory cache.

---

## Shared pipeline (runs for both)

| Metric | Value |
|---|---|
| Snapshots captured (at doc time) | 2 (2026-04-16 22:00Z + 23:00Z) |
| Rows in SQLite history | 2,350 |
| Fetch success rate | 3/3 (100%) |
| Hourly cron | `/etc/cron.d/openugi-fetch` with 0-5 min jitter |
| Disk growth | ~100 KB/hour (~860 MB/year forever) |

History tables enable future features: per-model trend charts, week-over-week rank deltas, ideology shifts over time — neither A nor B exposes these yet, but the data is accumulating.

---

## Subjective / qualitative

### Version A — "modernized vanilla"

- **Pro**: Tiny payload. Zero JS framework to upgrade. Source is one HTML / one JS / two CSS files. A beginner can read the entire frontend in 10 minutes.
- **Pro**: Identical look and feel to the original — if you liked what was there, this is that but working correctly.
- **Pro**: Deploys in ~5 seconds (copy files + restart PM2).
- **Con**: You saw empty-state → data flash on page load (API roundtrip after hydrate).
- **Con**: No server-side rendering, no static optimization. Each feature addition is manual.
- **Con**: i18n is a hand-rolled object literal you mutate in place.

### Version B — "full modern rewrite"

- **Pro**: Leaderboard renders instantly (SSR with all 1175 rows baked into HTML). No loading flash.
- **Pro**: Typescript throughout. tanstack-table drives sort/filter/search with virtualization-ready primitives. Framer Motion gives you smooth row animations, card stagger, and a shimmer title effect.
- **Pro**: Tailwind + shadcn — adding new UI is 3 lines, and it's consistent.
- **Pro**: next-intl with proper ICU message format, RTL support for Arabic, and locale-aware plurals (`{count, plural, …}`).
- **Pro**: Proper dark mode (OS preference detection, localStorage persistence, class-based toggle via Radix).
- **Con**: Initial HTML is 1.8 MB (because SSR inlines the whole table — tradeoff for instant paint).
- **Con**: `.next/` build artifacts are bigger on disk.
- **Con**: Build step (~30s locally) is now part of the deploy loop.
- **Con**: More moving parts to understand / upgrade (Next.js major version bumps, React 19 transition, etc.).

---

## My recommendation

If this were my own project, **I'd pick B**. The user-facing experience is measurably better (instant render, smoother interactions, proper i18n, polished dark mode), and the code quality is dramatically higher — half the lines, TypeScript, componentized, modern idioms. The 1.8 MB initial HTML sounds scary but it's offset by never needing a JSON roundtrip before paint, and it compresses to ~150 KB over the wire.

If you mostly cared about keeping things simple enough that you could edit it yourself in a text editor without understanding Next.js, **A is still a solid choice** — a much improved version of what was there. For a one-page leaderboard that doesn't need rich interactions, it's fine.

But my real answer: **open both tabs side-by-side and see which one feels like the product you want to show people.** That's the only comparison that matters.

Both are sharing the same data pipeline, so when the winner is chosen, migrating the DNS (`openugi.com` A record webhost) takes <1 minute and the other subdomain can be retired or kept as a reference.
