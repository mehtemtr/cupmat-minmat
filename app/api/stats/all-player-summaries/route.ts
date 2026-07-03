import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getPlayerMapping } from "@/lib/fantasy/points";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Resolve dynamic player mapping at runtime
    const { uuidToStatic } = await getPlayerMapping();

    // 2. Fetch all rows from player_stage_stats (with pagination)
    const allStats: any[] = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from("player_stage_stats")
        .select("player_id, points, goals, assists, minutes_played, goals_conceded")
        .range(from, to);

      if (error) {
        console.error("[All-Player-Summaries] DB Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      if (data && data.length > 0) {
        allStats.push(...data);
        if (data.length < 1000) {
          hasMore = false;
        } else {
          from += 1000;
          to += 1000;
        }
      } else {
        hasMore = false;
      }
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
      const staticId = uuidToStatic[dbUuid];
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

    return new NextResponse(JSON.stringify({
      success: true,
      summaries
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=10, s-maxage=10, stale-while-revalidate=5"
      }
    });

  } catch (error: any) {
    console.error("[All-Player-Summaries] Runtime Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
