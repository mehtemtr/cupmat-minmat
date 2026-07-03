import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import playerDbMap from "@/data/player-db-map.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "not-set";
    const keyLen = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").length;
    const keyStart = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").substring(0, 15);

    // Count rows in team_rosters
    const { count: rosterCount, error: rosterErr } = await supabaseAdmin
      .from("team_rosters")
      .select("*", { count: "exact", head: true });

    // Count rows in player_stage_stats
    const { count: statsCount, error: statsErr } = await supabaseAdmin
      .from("player_stage_stats")
      .select("*", { count: "exact", head: true });

    const mapKeysCount = Object.keys(playerDbMap).length;

    return NextResponse.json({
      success: true,
      env: {
        url,
        keyLen,
        keyStart,
      },
      db: {
        rosterCount,
        rosterErr: rosterErr?.message || null,
        statsCount,
        statsErr: statsErr?.message || null,
      },
      mapKeysCount
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
