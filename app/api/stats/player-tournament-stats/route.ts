import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAllPlayers } from "@/data/teams";
import playerDbMap from "@/data/player-db-map.json";

export const dynamic = "force-dynamic";

// Normalize helper for fallback matching
function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-\s]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

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

    // 1. Try direct UUID lookup from pre-built mapping
    const dbUUID = (playerDbMap as Record<string, string>)[playerId];
    let playerDbId: string | null = dbUUID || null;

    // 2. Fallback: query team_rosters and match by normalized name
    if (!playerDbId) {
      const { data: dbPlayers } = await supabaseAdmin
        .from("team_rosters")
        .select("id, player_name, player_number")
        .eq("team_id", player.teamId);

      if (dbPlayers && dbPlayers.length > 0) {
        const cleanSp = normalize(player.name);

        // Try normalized match
        let found = dbPlayers.find((dp) => normalize(dp.player_name) === cleanSp);

        // Substring match
        if (!found) {
          found = dbPlayers.find(
            (dp) =>
              normalize(dp.player_name).includes(cleanSp) ||
              cleanSp.includes(normalize(dp.player_name))
          );
        }

        // Last name match
        if (!found) {
          const parts = player.name.split(/[\s-]/).filter((p) => p.length > 1);
          const lastName = normalize(parts[parts.length - 1] || "");
          if (lastName.length > 2) {
            const candidates = dbPlayers.filter((dp) => {
              const dbParts = dp.player_name.split(/[\s-]/).filter((pt: string) => pt.length > 1);
              return normalize(dbParts[dbParts.length - 1] || "") === lastName;
            });
            if (candidates.length === 1) found = candidates[0];
          }
        }

        if (found) playerDbId = found.id;
      }
    }

    if (!playerDbId) {
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

    // 3. Fetch stats from player_stage_stats
    const { data: stageStats, error: statsError } = await supabaseAdmin
      .from("player_stage_stats")
      .select("*")
      .eq("player_id", playerDbId);

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
      if ((s.minutes_played || 0) > 0) matchesPlayed++;
      goals += s.goals || 0;
      assists += s.assists || 0;
      yellowCards += s.yellow_cards || 0;
      redCards += s.red_cards || 0;
      ownGoals += s.own_goals || 0;
      if (s.clean_sheet) cleanSheets++;
      points += s.points || 0;
    });

    return NextResponse.json({
      success: true,
      stats: { matchesPlayed, goals, assists, yellowCards, redCards, ownGoals, cleanSheets, points }
    });

  } catch (error: any) {
    console.error("[Player-Tournament-Stats] Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
