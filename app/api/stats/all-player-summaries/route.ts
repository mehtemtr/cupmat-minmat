import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import playerDbMap from "@/data/player-db-map.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Build a reverse map: DB UUID -> Static Player ID
    const dbToStatic: Record<string, string> = {};
    for (const [staticId, dbUuid] of Object.entries(playerDbMap)) {
      dbToStatic[dbUuid] = staticId;
    }

    // 2. Fetch all rows from player_stage_stats
    const { data: allStats, error } = await supabaseAdmin
      .from("player_stage_stats")
      .select("player_id, points, goals, assists, minutes_played, goals_conceded");

    if (error) {
      console.error("[All-Player-Summaries] Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 3. Aggregate stats by static ID
    const summaries: Record<string, {
      points: number;
      goals: number;
      assists: number;
      matchesPlayed: number;
      goalsConceded: number;
    }> = {};

    (allStats || []).forEach((row) => {
      const dbUuid = row.player_id;
      const staticId = dbToStatic[dbUuid];
      if (!staticId) return;

      if (!summaries[staticId]) {
        summaries[staticId] = {
          points: 0,
          goals: 0,
          assists: 0,
          matchesPlayed: 0,
          goalsConceded: 0,
        };
      }

      const playerSummary = summaries[staticId];
      playerSummary.points += row.points || 0;
      playerSummary.goals += row.goals || 0;
      playerSummary.assists += row.assists || 0;
      playerSummary.goalsConceded += row.goals_conceded || 0;
      if ((row.minutes_played || 0) > 0) {
        playerSummary.matchesPlayed += 1;
      }
    });

    return NextResponse.json({
      success: true,
      summaries
    });

  } catch (error: any) {
    console.error("[All-Player-Summaries] Runtime Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
