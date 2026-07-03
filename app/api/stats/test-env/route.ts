import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import playerDbMap from "@/data/player-db-map.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "not-set";

    // Count rows in team_rosters
    const { count: rosterCount } = await supabaseAdmin
      .from("team_rosters")
      .select("*", { count: "exact", head: true });

    // Count rows in player_stage_stats
    const { count: statsCount } = await supabaseAdmin
      .from("player_stage_stats")
      .select("*", { count: "exact", head: true });

    // Fetch 5 rows from player_stage_stats
    const { data: sampleStats } = await supabaseAdmin
      .from("player_stage_stats")
      .select("player_id, stage, goals")
      .limit(5);

    // Build a reverse map: DB UUID -> Static Player ID
    const dbToStatic: Record<string, string> = {};
    for (const [staticId, dbUuid] of Object.entries(playerDbMap)) {
      dbToStatic[dbUuid] = staticId;
    }

    const sampleMatches = (sampleStats || []).map((s) => {
      const dbUuid = s.player_id;
      const staticId = dbToStatic[dbUuid] || "NOT-FOUND";
      const directMapVal = Object.values(playerDbMap).includes(dbUuid);
      return {
        dbUuid,
        staticId,
        directMapVal
      };
    });

    const mapKeysCount = Object.keys(playerDbMap).length;
    const sampleMapEntries = Object.entries(playerDbMap).slice(0, 5);

    return NextResponse.json({
      success: true,
      rosterCount,
      statsCount,
      mapKeysCount,
      sampleMapEntries,
      sampleMatches,
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
