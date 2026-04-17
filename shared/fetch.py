#!/usr/bin/env python3
"""
OpenUGI data fetcher — replaces the original fetch_data.py + auto_fetch.py.

Behavior per invocation (run by cron `0 * * * *`):
  1. Sleep a random jitter 0-300s (avoid hitting HF on the exact minute as everyone else).
  2. Download CSV from HuggingFace with 3-try exponential backoff.
  3. Archive raw CSV gzipped to archive/YYYY-MM-DD/HH.csv.gz.
  4. Parse CSV -> list of dicts.
  5. Write latest snapshot atomically to data/leaderboard.json (both A and B read this).
  6. Also write archive/YYYY-MM-DD/HH.json (full JSON snapshot preserved forever).
  7. Insert every row into SQLite `snapshots` table keyed by (snapshot_ts, model).
  8. Log result to `fetch_log` table.

All paths are relative to --base-dir (defaults to script's dir). Safe to run
multiple times per hour: snapshots are keyed by timestamp floored to the hour.

Exit 0 on success, non-zero on failure (cron mail alerts you).
"""
from __future__ import annotations

import argparse
import csv
import gzip
import json
import os
import random
import sqlite3
import sys
import time
import traceback
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path

import requests

CSV_URL = "https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard/resolve/main/ugi-leaderboard-data.csv"
USER_AGENT = "openugi-fetcher/2.0 (https://openugi.com)"
RETRY_DELAYS = [5, 15, 45]  # seconds; 3 attempts total
HTTP_TIMEOUT = 30


def now_iso() -> str:
    """Current UTC timestamp as ISO 8601 second-precision."""
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def hour_bucket(ts: datetime) -> tuple[str, str, str]:
    """Return (YYYY-MM-DD, HH, snapshot_ts) — floors to the hour."""
    bucket = ts.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
    return bucket.strftime("%Y-%m-%d"), bucket.strftime("%H"), bucket.isoformat().replace("+00:00", "Z")


def download_csv() -> str:
    """Fetch the CSV from HuggingFace. Retries 3x with exponential backoff. Raises on final failure."""
    last_exc = None
    for attempt, delay in enumerate([0] + RETRY_DELAYS):
        if delay:
            print(f"  retry {attempt} after {delay}s...", flush=True)
            time.sleep(delay)
        try:
            r = requests.get(CSV_URL, headers={"User-Agent": USER_AGENT}, timeout=HTTP_TIMEOUT)
            r.raise_for_status()
            return r.text
        except Exception as e:
            last_exc = e
            print(f"  attempt {attempt + 1} failed: {e}", flush=True)
    raise RuntimeError(f"all retries exhausted; last error: {last_exc}")


def parse_csv(csv_text: str) -> list[dict]:
    """Parse HF CSV to list of {model, ugi, w10, ideology} dicts, sorted by UGI desc."""
    reader = csv.DictReader(StringIO(csv_text))
    rows: list[dict] = []

    def _float(val: str) -> float:
        if not val or val == "N/A":
            return 0.0
        try:
            return float(val)
        except ValueError:
            return 0.0

    for row in reader:
        # HF prepends BOM sometimes — tolerate both column name variants
        model = (row.get("author/model_name") or row.get("\ufeffauthor/model_name") or "").strip()
        if not model:
            continue
        # Ideology column renamed upstream: "Ideology Name" (old) -> "12axes Ideology" (new, as of ~2025-09).
        # Tolerate both so we don't silently collapse to "Unknown" when HF tweaks the header again.
        ideology_raw = (
            row.get("12axes Ideology")
            or row.get("Ideology Name")
            or row.get("Political Lean \U0001F4CB")  # "Political Lean 📋" — numeric fallback, not a label
            or "Unknown"
        )
        rows.append({
            "model": model,
            "ugi": _float(row.get("UGI \U0001F3C6", "0")),     # "UGI 🏆"
            "w10": _float(row.get("W/10 \U0001F44D", "0")),    # "W/10 👍"
            "ideology": ideology_raw.strip() or "Unknown",
        })

    rows.sort(key=lambda r: r["ugi"], reverse=True)
    return rows


def atomic_write_json(path: Path, obj: dict) -> None:
    """Write obj as JSON atomically (rename from tmp file)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
    tmp.replace(path)


def write_archive(base_dir: Path, bucket_date: str, bucket_hour: str, csv_text: str, snapshot_obj: dict) -> tuple[Path, Path]:
    """Persist raw csv.gz and the full json snapshot for this hour. Returns (csv_path, json_path)."""
    archive_dir = base_dir / "archive" / bucket_date
    archive_dir.mkdir(parents=True, exist_ok=True)

    csv_path = archive_dir / f"{bucket_hour}.csv.gz"
    with gzip.open(csv_path, "wt") as f:
        f.write(csv_text)

    json_path = archive_dir / f"{bucket_hour}.json"
    atomic_write_json(json_path, snapshot_obj)

    return csv_path, json_path


def upsert_snapshots(db_path: Path, snapshot_ts: str, rows: list[dict]) -> int:
    """Insert this snapshot's rows into SQLite. Returns rowcount inserted/replaced."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    try:
        # Ensure schema exists (idempotent)
        schema_file = Path(__file__).parent / "schema.sql"
        if schema_file.exists():
            conn.executescript(schema_file.read_text())

        records = [
            (snapshot_ts, r["model"], r["ugi"], r["w10"], r["ideology"], rank)
            for rank, r in enumerate(rows, start=1)
        ]
        conn.executemany(
            "INSERT OR REPLACE INTO snapshots(snapshot_ts, model, ugi, w10, ideology, rank) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            records,
        )
        conn.commit()
        return len(records)
    finally:
        conn.close()


def log_fetch(db_path: Path, ts: str, status: str, models_count: int | None, duration_ms: int, error_msg: str | None) -> None:
    """Record this fetch attempt in fetch_log table. Never raises."""
    try:
        conn = sqlite3.connect(db_path)
        try:
            schema_file = Path(__file__).parent / "schema.sql"
            if schema_file.exists():
                conn.executescript(schema_file.read_text())
            conn.execute(
                "INSERT OR REPLACE INTO fetch_log(ts, status, models_count, duration_ms, error_msg) "
                "VALUES (?, ?, ?, ?, ?)",
                (ts, status, models_count, duration_ms, error_msg),
            )
            conn.commit()
        finally:
            conn.close()
    except Exception as e:
        print(f"  WARN: failed to log fetch to db: {e}", flush=True)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base-dir", default=str(Path(__file__).parent), help="root for data/, archive/, logs/")
    ap.add_argument("--no-jitter", action="store_true", help="skip the 0-5min random sleep (for ad-hoc runs)")
    ap.add_argument("--max-jitter", type=int, default=300, help="max jitter in seconds (default: 300)")
    args = ap.parse_args()

    base = Path(args.base_dir).resolve()
    db_path = base / "data" / "history.db"
    latest_path = base / "data" / "leaderboard.json"

    if not args.no_jitter and args.max_jitter > 0:
        jitter = random.randint(0, args.max_jitter)
        print(f"[{now_iso()}] jitter: sleeping {jitter}s", flush=True)
        time.sleep(jitter)

    start_ts = now_iso()
    start_wall = time.time()
    print(f"[{start_ts}] fetching {CSV_URL}", flush=True)

    try:
        csv_text = download_csv()
        rows = parse_csv(csv_text)
        if not rows:
            raise RuntimeError("CSV parsed 0 rows — likely upstream format change")

        now = datetime.now(timezone.utc)
        bucket_date, bucket_hour, snapshot_ts = hour_bucket(now)

        snapshot_obj = {
            "lastUpdated": now.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "snapshotTs": snapshot_ts,
            "data": rows,
        }

        # Write latest snapshot (what A/B frontends consume)
        atomic_write_json(latest_path, snapshot_obj)
        print(f"  wrote latest -> {latest_path}", flush=True)

        # Archive raw csv.gz + full json
        csv_path, json_path = write_archive(base, bucket_date, bucket_hour, csv_text, snapshot_obj)
        print(f"  archived csv -> {csv_path}", flush=True)
        print(f"  archived json -> {json_path}", flush=True)

        # Upsert into SQLite for time-series queries
        inserted = upsert_snapshots(db_path, snapshot_ts, rows)
        print(f"  upserted {inserted} rows into {db_path}", flush=True)

        duration_ms = int((time.time() - start_wall) * 1000)
        log_fetch(db_path, start_ts, "success", len(rows), duration_ms, None)
        print(f"[{now_iso()}] done in {duration_ms}ms, {len(rows)} models", flush=True)
        return 0

    except Exception as e:
        duration_ms = int((time.time() - start_wall) * 1000)
        err = f"{type(e).__name__}: {e}\n{traceback.format_exc()}"
        print(f"[{now_iso()}] FETCH FAILED after {duration_ms}ms:\n{err}", flush=True, file=sys.stderr)
        log_fetch(db_path, start_ts, "error", None, duration_ms, err[:2000])
        return 1


if __name__ == "__main__":
    sys.exit(main())
