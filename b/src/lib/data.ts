import { promises as fs } from "fs";
import path from "path";

export type Model = {
  model: string;
  ugi: number;
  w10: number;
  ideology: string;
};

export type Snapshot = {
  lastUpdated: string;
  snapshotTs?: string;
  data: Model[];
};

const DATA_PATH =
  process.env.OPENUGI_DATA_PATH ||
  path.join(process.cwd(), "..", "shared", "data", "leaderboard.json");

/** In-process cache for the leaderboard snapshot. Invalidated by mtime. */
type Cache = { snapshot: Snapshot; mtimeMs: number } | null;
let cache: Cache = null;

export async function loadSnapshot(): Promise<Snapshot> {
  const stat = await fs.stat(DATA_PATH);
  if (cache && cache.mtimeMs === stat.mtimeMs) return cache.snapshot;
  const text = await fs.readFile(DATA_PATH, "utf8");
  const snapshot = JSON.parse(text) as Snapshot;
  cache = { snapshot, mtimeMs: stat.mtimeMs };
  return snapshot;
}

export async function getStats() {
  const { data, lastUpdated, snapshotTs } = await loadSnapshot();
  const ideologyDistribution: Record<string, number> = {};
  let topUGI = 0;
  for (const m of data) {
    const id = m.ideology || "Unknown";
    ideologyDistribution[id] = (ideologyDistribution[id] || 0) + 1;
    if (m.ugi > topUGI) topUGI = m.ugi;
  }
  return {
    totalModels: data.length,
    topUGI,
    lastUpdated,
    snapshotTs: snapshotTs ?? null,
    ideologyDistribution,
  };
}
