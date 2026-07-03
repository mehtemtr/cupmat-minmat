import { NextResponse } from "next/server";
import { runPlayerStatsSync } from "@/lib/stats/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("[API-Stats-Sync] Manual trigger started...");
    const result = await runPlayerStatsSync();
    console.log("[API-Stats-Sync] Completed:", result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[API-Stats-Sync] Error during execution:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
