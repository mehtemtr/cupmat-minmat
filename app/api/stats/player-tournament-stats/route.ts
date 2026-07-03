import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAllPlayers } from "@/data/teams";

export const dynamic = "force-dynamic";

// Normalize helper - same as sync script
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

// Try to find the best name match between English static data name and DB Turkish names
function findBestPlayerMatch(
  staticName: string,
  dbPlayers: { id: string; player_name: string; player_number?: number }[],
  jerseyNumber?: number
): any | null {
  const cleanEn = normalizeName(staticName);
  if (!cleanEn) return null;

  // 1. Jersey number exact match (most reliable)
  if (jerseyNumber) {
    const byNumber = dbPlayers.find((p) => p.player_number === jerseyNumber);
    if (byNumber) return byNumber;
  }

  // 2. Exact clean name match
  let match = dbPlayers.find((p) => normalizeName(p.player_name) === cleanEn);
  if (match) return match;

  // 3. Substring match (either way)
  match = dbPlayers.find(
    (p) =>
      normalizeName(p.player_name).includes(cleanEn) ||
      cleanEn.includes(normalizeName(p.player_name))
  );
  if (match) return match;

  // 4. Last name match
  const parts = staticName.split(" ").filter((p) => p.length > 0);
  const lastName = normalizeName(parts[parts.length - 1] || "");

  if (lastName.length > 2) {
    const byLastName = dbPlayers.filter((p) => {
      const dbParts = p.player_name.split(" ").filter((pt: string) => pt.length > 0);
      const dbLastName = normalizeName(dbParts[dbParts.length - 1] || "");
      return dbLastName === lastName;
    });
    if (byLastName.length === 1) return byLastName[0];
  }

  return null;
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

    // 1. Fetch team roster from DB to get the UUID
    const { data: dbPlayers, error: rosterError } = await supabaseAdmin
      .from("team_rosters")
      .select("id, player_name, team_id, player_position, player_number")
      .eq("team_id", player.teamId);

    if (rosterError) {
      console.error("[Player-Tournament-Stats] Roster error:", rosterError);
      return NextResponse.json({ success: false, error: rosterError.message }, { status: 500 });
    }

    // Extract jersey number from player id if available (e.g. mex-p1 -> 1)
    const idParts = playerId.split("-p");
    const playerIndex = idParts.length > 1 ? parseInt(idParts[1], 10) : null;

    const matchedPlayer = findBestPlayerMatch(player.name, dbPlayers || [], playerIndex ?? undefined);
    if (!matchedPlayer) {
      console.log(`[Player-Tournament-Stats] No DB match found for '${player.name}' (${player.teamId})`);
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
