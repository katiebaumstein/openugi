import { NextResponse } from "next/server";
import { getStats } from "@/lib/data";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (e) {
    console.error("stats read error:", e);
    return NextResponse.json({ error: "Stats unavailable" }, { status: 503 });
  }
}
