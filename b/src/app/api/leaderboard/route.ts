import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/data";

/** JSON API — same shape as Version A's /api/leaderboard for compatibility. */
export async function GET() {
  try {
    const snapshot = await loadSnapshot();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (e) {
    console.error("leaderboard read error:", e);
    return NextResponse.json({ error: "Data unavailable" }, { status: 503 });
  }
}
