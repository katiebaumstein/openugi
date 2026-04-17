# OpenUGI Shared Data Pipeline

Single hourly cron job that feeds **both** Version A (vanilla) and Version B (Next.js). Writes:

1. `data/leaderboard.json` — **latest snapshot** (what both frontends consume)
2. `archive/YYYY-MM-DD/HH.json` — **full JSON snapshot** preserved forever
3. `archive/YYYY-MM-DD/HH.csv.gz` — **raw CSV archived** (gzipped, ~20KB each)
4. `data/history.db` — **SQLite time-series** with every model's score at every hour

## Why all three copies?

| Purpose | Format |
|---|---|
| Live UI reads | `data/leaderboard.json` (one flat file, memory-mappable) |
| Debugging upstream changes | `archive/.../HH.csv.gz` (original upstream payload) |
| Per-hour snapshots that JSON-tool friendly | `archive/.../HH.json` (human-browsable) |
| Trend charts, deltas, history queries | `data/history.db` (SQLite + indexes) |

Total disk: ~100KB/hour × 8760 h/yr = **~860MB/year**, all in.

## Usage

```bash
# One-off fetch (no jitter sleep)
python3 fetch.py --no-jitter

# Cron mode (respects 0-5min random jitter)
python3 fetch.py

# Alt base dir (defaults to script's dir)
python3 fetch.py --base-dir /var/www/openugi-shared
```

## Cron installation on webhost

```cron
# /etc/cron.d/openugi-fetch
0 * * * * admin cd /var/www/openugi-shared && /usr/bin/python3 fetch.py >> logs/fetch.log 2>&1
```

(Jitter inside the script randomizes the actual fetch between :00 and :05 past the hour.)

## SQLite schema

See [schema.sql](schema.sql). Two tables: `snapshots` (one row per model per hour) and `fetch_log` (audit).

Example queries:
```sql
-- Latest rankings
SELECT rank, model, ugi, w10, ideology FROM snapshots
WHERE snapshot_ts = (SELECT MAX(snapshot_ts) FROM snapshots)
ORDER BY rank;

-- Model trend over last 30 days
SELECT snapshot_ts, ugi, rank FROM snapshots
WHERE model = 'meta-llama/Llama-3.1-70B'
  AND snapshot_ts > datetime('now', '-30 days')
ORDER BY snapshot_ts;

-- Fetch health
SELECT status, COUNT(*), AVG(duration_ms) FROM fetch_log
WHERE ts > datetime('now', '-7 days')
GROUP BY status;
```

## Failure behavior

- 3-try exponential backoff on HTTP (5s / 15s / 45s)
- On final failure: logs error to `fetch_log`, returns non-zero (cron can mail alert)
- Latest snapshot is NEVER overwritten with partial/empty data (raises if 0 rows parsed)
