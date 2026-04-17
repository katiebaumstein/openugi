# OpenUGI — Uncensored General Intelligence Leaderboard

Web interface for the [UGI Leaderboard](https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard) — ranks 1,000+ AI models by:
- **UGI Score** (0-100): knowledge breadth on uncensored topics
- **W/10 Score** (0-10): willingness to answer controversial questions

**Live**: https://openugi.com

## Architecture

```
┌─ openugi.com / www.openugi.com (SSL) ─────── Nginx reverse proxy
│                                                    ↓
│                                              PM2 openugi-b :4003
│                                              (Next.js standalone)
│                                                    ↓ reads
│  b.openugi.com (SSL) ─── 301 → openugi.com   /var/www/openugi-shared/data/leaderboard.json
│                                                    ↑ updated by
│                                              cron 0 * * * * → shared/fetch.py
│                                              (jitter 0-5min, 3-try backoff)
│                                                    ↓ also writes
│                                              SQLite history.db + archive/YYYY-MM-DD/HH.{json,csv.gz}
│
└─ on the server (webhost, AWS Lightsail, 107.20.206.158)
```

## Directory layout

| Path | What | Production location |
|---|---|---|
| [`b/`](b/) | **Active** — Next.js 14 + Tailwind + shadcn + next-intl + Framer Motion | `/var/www/openugi-b/` |
| [`shared/`](shared/) | Hourly data pipeline (Python + SQLite) | `/var/www/openugi-shared/` |
| [`COMPARISON.md`](COMPARISON.md) | A-vs-B analysis from the architecture review | — |
| `*.png`, `*.js`, `*.html` (root) | **Legacy v1** — preserved for historical reference; not deployed anywhere | — |

Old Version A (targeted-refresh vanilla) was deployed to `a.openugi.com` during the A/B trial and retired after Version B was selected. See git history for the A/ source.

## Tech stack

- **Frontend**: Next.js 14 (App Router, Server Components) + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui primitives + custom Ghibli-themed CSS variables
- **Animation**: Framer Motion (hero logo float, card stagger, row fade)
- **i18n**: next-intl (EN/ZH/AR with ICU pluralization and RTL)
- **Table**: @tanstack/react-table (sort/filter/search)
- **Backend**: Next.js standalone server (no separate Express), reads shared JSON via mtime-invalidated in-memory cache
- **Data pipeline**: Python + SQLite + gzipped CSV archive
- **Hosting**: AWS Lightsail (webhost), Nginx reverse proxy, PM2, Let's Encrypt SSL auto-renew

## Local dev

```bash
# Make sure shared data exists locally
cd shared && python3 fetch.py --no-jitter

# Run the app
cd ../b
npm install
npm run dev      # http://localhost:4003
```

## Deploy (from local Mac)

```bash
cd b
./deploy.sh      # builds locally, scps standalone bundle to webhost, restarts PM2
```

## API endpoints

All served under https://openugi.com (and https://b.openugi.com → 301):

| Endpoint | Description |
|---|---|
| `GET /` | Main leaderboard page (SSR'd with data inline) |
| `GET /api/leaderboard` | Full snapshot JSON |
| `GET /api/stats` | Aggregate stats (totals, top UGI, ideology distribution) |
| `GET /api/health` | Liveness check |

## Data history

Every hour's snapshot is preserved in three forms:

1. **`data/leaderboard.json`** — latest (what the app reads)
2. **`archive/YYYY-MM-DD/HH.json`** — human-browsable JSON snapshot per hour
3. **`archive/YYYY-MM-DD/HH.csv.gz`** — raw upstream CSV, gzipped
4. **`data/history.db`** — SQLite time-series, one row per (timestamp, model)

Query history:
```sql
-- This model's UGI trend over last 30 days
SELECT snapshot_ts, ugi, rank FROM snapshots
WHERE model = 'xai/grok-4-0709' AND snapshot_ts > datetime('now','-30 days')
ORDER BY snapshot_ts;
```

Disk cost: ~100 KB/hour = ~860 MB/year. Preserved forever.

## Credentials / ops

- **GitHub**: `git@github.com:katiebaumstein/openugi.git` (private)
- **Domain**: Route53 zone `Z08554453618KEFYOLFBD` for `openugi.com` + `www.openugi.com`
- **SSL**: Let's Encrypt via certbot `--nginx` on webhost, auto-renew
- **PM2 name**: `openugi-b` (port 4003, fork mode, 256MB cap)
- **Systemd cron**: `/etc/cron.d/openugi-fetch` on webhost, runs `/var/www/openugi-shared/fetch.py` hourly

## License

MIT
