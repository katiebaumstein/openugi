-- OpenUGI historical data schema (SQLite)
-- Holds every hourly snapshot of the UGI leaderboard.
-- Shared between Version A and Version B; both read latest snapshot,
-- either can query historical rows for trend charts later.

CREATE TABLE IF NOT EXISTS snapshots (
  snapshot_ts TEXT NOT NULL,      -- ISO 8601 UTC, e.g. '2026-04-17T12:00:00Z'
  model       TEXT NOT NULL,      -- 'author/model_name' from HF CSV
  ugi         REAL,               -- UGI score 0-100
  w10         REAL,               -- W/10 score 0-10
  ideology    TEXT,               -- Ideology Name
  rank        INTEGER,            -- 1-based rank at this snapshot (sorted by UGI desc)
  PRIMARY KEY (snapshot_ts, model)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_model_ts ON snapshots(model, snapshot_ts);
CREATE INDEX IF NOT EXISTS idx_snapshots_ts       ON snapshots(snapshot_ts DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_ideology ON snapshots(ideology, snapshot_ts);

-- Fetch audit log: one row per fetch attempt (success or failure)
CREATE TABLE IF NOT EXISTS fetch_log (
  ts            TEXT PRIMARY KEY,   -- when the fetch started (ISO 8601 UTC)
  status        TEXT NOT NULL,      -- 'success' | 'error'
  models_count  INTEGER,            -- models parsed (success only)
  duration_ms   INTEGER,            -- wall-clock duration
  error_msg     TEXT                -- stack or HTTP error (error only)
);
