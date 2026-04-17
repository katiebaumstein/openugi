import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/data";

export async function GET() {
  try {
    const snap = await loadSnapshot();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "openugi-b",
      modelsCount: snap.data.length,
      snapshotTs: snap.snapshotTs ?? null,
      lastUpdated: snap.lastUpdated,
    });
  } catch (e) {
    return NextResponse.json({ status: "degraded", error: String(e) }, { status: 503 });
  }
}
