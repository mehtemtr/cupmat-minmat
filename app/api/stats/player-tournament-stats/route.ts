import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAllPlayers, TEAMS } from "@/data/teams";
import { getPlayerMapping } from "@/lib/fantasy/points";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Normalize helper for matching
function normalize(name: string): string {
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
    .replace(/[-\s]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Build TR team name -> Team ID map
const teamMap = new Map<string, string>();
TEAMS.forEach((team) => {
  teamMap.set(normalize(team.nameTr), team.id.toLowerCase());
});

const teamOverrides: Record<string, string> = {
  "abd": "usa",
  "kongodc": "cod",
  "kongodemokratikcumhuriyeti": "cod",
  "yesilburun": "cpv",
  "yesilburunadalari": "cpv",
};

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

    // 1. Try direct UUID lookup from dynamic mapping
    const { staticToUuid } = await getPlayerMapping();
    const dbUUID = staticToUuid[playerId];
    let playerDbId: string | null = dbUUID || null;

    // 2. Query team_rosters to get player details (jersey_number)
    const { data: dbPlayers, error: rosterError } = await supabaseAdmin
      .from("team_rosters")
      .select("id, player_name, player_number, player_position")
      .eq("team_id", player.teamId);

    if (rosterError) {
      console.error("[Player-Tournament-Stats] Roster error:", rosterError);
      return NextResponse.json({ success: false, error: rosterError.message }, { status: 500 });
    }

    // Fallback: match by normalized name
    if (!playerDbId && dbPlayers && dbPlayers.length > 0) {
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

    // Initialize stats variables
    let matchesPlayed = 0;
    let goals = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    let ownGoals = 0;
    let cleanSheets = 0;
    let points = 0;

    // Goalkeeper specific stats
    let goalsConceded = 0;
    let saves = 0;
    let penaltySaved = 0;
    let shotsOnGoalAgainst = 0;
    let xgConceded = 0;
    let xgotConceded = 0;
    let goalsPrevented = 0;
    let claimedCrosses = 0;
    let clearances = 0;
    let punches = 0;

    // Outfield specific stats
    let touches = 0;
    let xg = 0;
    let xa = 0;
    let shotsOnGoal = 0;
    let shots = 0;
    let bigChancesCreated = 0;
    let interceptions = 0;
    let duelsWon = 0;

    const isGK = player.position.toUpperCase() === "GK";

    if (playerDbId) {
      // 3. Fetch basic stats from player_stage_stats
      const { data: stageStats, error: statsError } = await supabaseAdmin
        .from("player_stage_stats")
        .select("*")
        .eq("player_id", playerDbId);

      if (statsError) {
        console.error("[Player-Tournament-Stats] Stats error:", statsError);
        return NextResponse.json({ success: false, error: statsError.message }, { status: 500 });
      }

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

      // 4. Fetch advanced stats from Excel JSON file if it exists
      try {
        const jsonPath = path.join(process.cwd(), "scratch/parsed_excel_stats.json");
        if (fs.existsSync(jsonPath)) {
          const parsedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
          const dbPlayer = dbPlayers?.find((p) => p.id === playerDbId);
          const jerseyNum = dbPlayer?.player_number;
          const dbPlayerName = dbPlayer?.player_name ? normalize(dbPlayer.player_name) : "";

          // Loop over stages in parsedData
          for (const stage of Object.keys(parsedData)) {
            const stageRows = parsedData[stage];
            for (const row of stageRows) {
              const normTeam = normalize(row.team_name);
              const teamId = teamOverrides[normTeam] || teamMap.get(normTeam);

              if (teamId === player.teamId.toLowerCase()) {
                // Match by jersey number first, then fallback to name matching
                const isMatch =
                  (jerseyNum && row.jersey_number === jerseyNum) ||
                  (dbPlayerName && normalize(row.player_name) === dbPlayerName) ||
                  (dbPlayerName && normalize(row.player_short) === dbPlayerName);

                if (isMatch) {
                  if (isGK) {
                    goalsConceded += row.goals_conceded || 0;
                    saves += row.saves || 0;
                    penaltySaved += row.penalty_saved || 0;
                    shotsOnGoalAgainst += row.shots_on_goal_against || 0;
                    xgConceded += parseFloat(row.xg_conceded || 0);
                    xgotConceded += parseFloat(row.xgot_conceded || 0);
                    goalsPrevented += parseFloat(row.goals_prevented || 0);
                    claimedCrosses += row.claimed_crosses || 0;
                    clearances += row.clearances || 0;
                    punches += row.punches || 0;
                  } else {
                    touches += row.touches || 0;
                    xg += parseFloat(row.xg || 0);
                    xa += parseFloat(row.xa || 0);
                    shotsOnGoal += row.shots_on_goal || 0;
                    shots += row.shots || 0;
                    bigChancesCreated += row.big_chances_created || 0;
                    interceptions += row.interceptions || 0;
                    duelsWon += row.duels_won || 0;
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("[Player-Tournament-Stats] Error reading Excel JSON:", e);
      }
    }

    return new NextResponse(JSON.stringify({
      success: true,
      stats: {
        matchesPlayed,
        goals,
        assists,
        yellowCards,
        redCards,
        ownGoals,
        cleanSheets,
        points,
        isGoalkeeper: isGK,
        // Goalkeeper stats
        goalsConceded,
        saves,
        penaltySaved,
        shotsOnGoalAgainst,
        xgConceded: parseFloat(xgConceded.toFixed(2)),
        xgotConceded: parseFloat(xgotConceded.toFixed(2)),
        goalsPrevented: parseFloat(goalsPrevented.toFixed(2)),
        claimedCrosses,
        clearances,
        punches,
        // Outfield stats
        touches,
        xg: parseFloat(xg.toFixed(2)),
        xa: parseFloat(xa.toFixed(2)),
        shotsOnGoal,
        shots,
        bigChancesCreated,
        interceptions,
        duelsWon
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=10, s-maxage=10, stale-while-revalidate=5"
      }
    });

  } catch (error: any) {
    console.error("[Player-Tournament-Stats] Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
