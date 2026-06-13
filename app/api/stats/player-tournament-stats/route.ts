import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAllPlayers } from "@/data/teams";
import { findBestPlayerMatch } from "@/lib/api-football";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("id");

    if (!playerId) {
      return NextResponse.json({ success: false, error: "Missing player ID" }, { status: 400 });
    }

    const allPlayers = getAllPlayers();
    const player = allPlayers.find((p) => p.id === playerId);

    if (!player) {
      return NextResponse.json({ success: false, error: "Player not found in static data" }, { status: 404 });
    }

    // 1. Fetch team roster from DB to get the UUID
    const { data: dbPlayers, error: rosterError } = await supabaseAdmin
      .from("team_rosters")
      .select("id, player_name, team_id, player_position")
      .eq("team_id", player.teamId);

    if (rosterError) {
      console.error("[Player-Tournament-Stats] Roster error:", rosterError);
      return NextResponse.json({ success: false, error: rosterError.message }, { status: 500 });
    }

    const matchedPlayer = findBestPlayerMatch(player.name, dbPlayers || []);
    if (!matchedPlayer) {
      return NextResponse.json({
        success: true,
        stats: {
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          ownGoals: 0,
          cleanSheets: 0,
          points: 0
        }
      });
    }

    // 2. Fetch stats from player_stage_stats
    const { data: stageStats, error: statsError } = await supabaseAdmin
      .from("player_stage_stats")
      .select("*")
      .eq("player_id", matchedPlayer.id);

    if (statsError) {
      console.error("[Player-Tournament-Stats] Stats error:", statsError);
      return NextResponse.json({ success: false, error: statsError.message }, { status: 500 });
    }

    let matchesPlayed = 0;
    let goals = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    let ownGoals = 0;
    let cleanSheets = 0;
    let points = 0;

    (stageStats || []).forEach((s) => {
      // A player has played if they participated in the match (minutes_played > 0)
      if (s.minutes_played > 0) {
        matchesPlayed++;
      }
      goals += s.goals || 0;
      assists += s.assists || 0;
      yellowCards += s.yellow_cards || 0;
      redCards += s.red_cards || 0;
      ownGoals += s.own_goals || 0;
      if (s.clean_sheet) {
        cleanSheets++;
      }
      points += s.points || 0;
    });

    return NextResponse.json({
      success: true,
      stats: {
        matchesPlayed,
        goals,
        assists,
        yellowCards,
        redCards,
        ownGoals,
        cleanSheets,
        points
      }
    });

  } catch (error: any) {
    console.error("[Player-Tournament-Stats] Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
