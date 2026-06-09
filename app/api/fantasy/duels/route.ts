import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { Redis } from "@upstash/redis";
import { ensureTimeSpacedBots } from "@/lib/fantasy/bot-registration";

const redis = Redis.fromEnv();

// Position mapper helper
function getGeneralPosition(pos: string): "GK" | "DEF" | "MID" | "FWD" {
  const p = pos?.toLowerCase() || "";
  if (p.includes("kaleci")) return "GK";
  if (p.includes("defans") || p.includes("bek") || p.includes("stoper")) return "DEF";
  if (p.includes("orta saha") || p.includes("libero") || p.includes("midfielder")) return "MID";
  if (p.includes("açık")) return "MID";
  if (p.includes("forvet")) return "FWD";
  return "FWD";
}

// Calculate score for a player based on stats and position
function calculatePlayerPoints(stats: any, position: string): number {
  if (!stats) return 0;
  const pos = getGeneralPosition(position);
  let pts = 0;

  // 1. Appearance Points
  const mins = stats.minutes_played || 0;
  if (mins >= 60) pts += 2;
  else if (mins > 0) pts += 1;

  // 2. Goal Points by Position & Progressive Brace/Hat-trick Bonus
  const goals = stats.goals || 0;
  if (goals > 0) {
    let goalValue = 3; // Forward
    if (pos === "GK") goalValue = 10;
    else if (pos === "DEF") goalValue = 7;
    else if (pos === "MID") goalValue = 5;

    pts += goals * goalValue;

    // Multi-goal bonus
    if (goals === 2) pts += 2; // Brace bonus
    else if (goals >= 3) pts += 5; // Hat-trick bonus
  }

  // 3. Assist Points by Position
  const assists = stats.assists || 0;
  if (assists > 0) {
    let assistValue = 2; // Forward
    if (pos === "GK") assistValue = 5;
    else if (pos === "DEF") assistValue = 4;
    else if (pos === "MID") assistValue = 3;

    pts += assists * assistValue;
  }

  // 4. Clean Sheets (GK & DEF & MID)
  if (stats.clean_sheet) {
    if (pos === "GK") pts += 5;
    else if (pos === "DEF") pts += 4;
    else if (pos === "MID") pts += 1;
  }

  // 5. Conceded Goals Penalties (GK & DEF only)
  const conceded = stats.goals_conceded || 0;
  if (conceded > 0 && (pos === "GK" || pos === "DEF")) {
    pts -= conceded * 1;
  }

  // 6. Outcome & Goal Margin Points
  if (stats.team_result === "win") {
    pts += 5;
    // +1 pt for every 3-goal margin (e.g. 3-0, 4-1 wins)
    const margin = stats.goal_difference || 0;
    if (margin >= 3) {
      pts += Math.floor(margin / 3);
    }
  } else if (stats.team_result === "draw") {
    pts += 2;
  } else if (stats.team_result === "loss") {
    pts -= 2;
    // -1 pt for every 3-goal margin loss
    const margin = stats.goal_difference || 0; // Negative margin
    const absoluteMargin = Math.abs(margin);
    if (absoluteMargin >= 3) {
      pts -= Math.floor(absoluteMargin / 3);
    }
  }

  // 7. Cards & Penalties
  pts -= (stats.yellow_cards || 0) * 1;

  // Red Card Position Penalties
  const redCards = stats.red_cards || 0;
  if (redCards > 0) {
    if (pos === "FWD") pts -= 5;
    else if (pos === "MID") pts -= 4;
    else if (pos === "DEF") pts -= 3;
    else if (pos === "GK") pts -= 2;
  }

  // Own Goals Position Penalties
  const ownGoals = stats.own_goals || 0;
  if (ownGoals > 0) {
    if (pos === "FWD") pts -= ownGoals * 5;
    else if (pos === "MID") pts -= ownGoals * 4;
    else if (pos === "DEF") pts -= ownGoals * 3;
    else if (pos === "GK") pts -= ownGoals * 2;
  }

  // Goalkeeper saves (+1 pt per 3 saves)
  const saves = stats.saves || 0;
  if (saves >= 3 && pos === "GK") {
    pts += Math.floor(saves / 3);
  }

  // Penalty Actions
  pts += (stats.penalty_saved || 0) * 5;
  pts -= (stats.penalty_missed || 0) * 3;
  pts += (stats.penalty_earned || 0) * 2;
  pts -= (stats.penalty_conceded || 0) * 1;

  return pts;
}

// Generate match tickers for player events
function getPlayerEvents(stats: any): string[] {
  if (!stats) return [];
  const events: string[] = [];
  if (stats.goals > 0) {
    events.push(`⚽ Gol x${stats.goals}`);
  }
  if (stats.assists > 0) {
    events.push(`🎯 Asist x${stats.assists}`);
  }
  if (stats.clean_sheet) {
    events.push("🛡️ Gol Yemedi");
  }
  if (stats.yellow_cards > 0) {
    events.push("🟨 Sarı Kart");
  }
  if (stats.red_cards > 0) {
    events.push("🟥 Kırmızı Kart");
  }
  if (stats.own_goals > 0) {
    events.push(`⚠️ Kendi Kalesine Gol x${stats.own_goals}`);
  }
  if (stats.penalty_saved > 0) {
    events.push(`🧤 Penaltı Kurtardı x${stats.penalty_saved}`);
  }
  if (stats.penalty_missed > 0) {
    events.push("❌ Penaltı Kaçırdı");
  }
  return events;
}

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    
    // Get active stage from Redis or default
    const activeStage = (await redis.get<string>("fantasy_active_stage")) || "matchday_1";
    const stage = searchParams.get("stage") || activeStage;

    // Ensure bots are lazily registered as time progresses
    await ensureTimeSpacedBots(stage, false);

    // 1. Fetch H2H Duel Standings
    const { data: standings, error: standingsError } = await supabaseAdmin
      .from("fantasy_duel_standings")
      .select("*")
      .order("points", { ascending: false })
      .order("total_roster_points", { ascending: false });

    if (standingsError) throw standingsError;

    // Fetch all registered rosters for this stage to display in "Tüm Takımlar" tab
    const { data: allStageRosters } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("team_name, user_id, formation")
      .eq("stage", stage);

    let registeredTeams: Array<{ teamName: string; nickname: string; formation: string }> = [];
    if (allStageRosters && allStageRosters.length > 0) {
      // Find all user IDs to load their nicknames
      const uIds = allStageRosters.map((r) => r.user_id).filter(Boolean);
      let nickMap: Record<string, string> = {};

      if (uIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, nickname")
          .in("id", uIds);

        if (profiles) {
          profiles.forEach((p) => {
            nickMap[p.id] = p.nickname || "Katılımcı";
          });
        }
      }

      registeredTeams = allStageRosters.map((r) => ({
        teamName: r.team_name,
        nickname: r.user_id ? nickMap[r.user_id] || "Katılımcı" : "Statmatik Bot",
        formation: r.formation,
      }));

      // Sort alphabetically by teamName (case-insensitive, localized to Turkish)
      registeredTeams.sort((a, b) => a.teamName.localeCompare(b.teamName, "tr"));
    }

    // 2. Fetch Fixtures for Current Stage
    const { data: duels, error: duelsError } = await supabaseAdmin
      .from("fantasy_duels")
      .select(`
        id,
        stage,
        roster_id_1,
        roster_id_2,
        user_id_1,
        user_id_2,
        score_1,
        score_2,
        result
      `)
      .eq("stage", stage);

    if (duelsError) throw duelsError;

    // Fetch team names and nicknames for duels
    const rosterIds = duels ? duels.flatMap((d) => [d.roster_id_1, d.roster_id_2].filter(Boolean)) : [];
    let rosterMap: Record<string, any> = {};

    if (rosterIds.length > 0) {
      const { data: rosterDetails } = await supabaseAdmin
        .from("fantasy_rosters")
        .select("id, team_name, user_id")
        .in("id", rosterIds);

      if (rosterDetails) {
        rosterDetails.forEach((r) => {
          rosterMap[r.id] = r;
        });
      }
    }

    const formattedDuels = (duels || []).map((duel) => {
      const roster1 = rosterMap[duel.roster_id_1 || ""];
      const roster2 = rosterMap[duel.roster_id_2 || ""];

      // Match user nicknames
      const user1Standing = standings?.find((s) => s.user_id === duel.user_id_1);
      const user2Standing = standings?.find((s) => s.user_id === duel.user_id_2);

      const name1 = roster1?.team_name || (duel.user_id_1 ? user1Standing?.nickname || "Kullanıcı 1" : "Statmatik Bot");
      const name2 = roster2?.team_name || (duel.user_id_2 ? user2Standing?.nickname || "Kullanıcı 2" : "Statmatik Bot");

      return {
        id: duel.id,
        stage: duel.stage,
        rosterId1: duel.roster_id_1,
        rosterId2: duel.roster_id_2,
        userId1: duel.user_id_1,
        userId2: duel.user_id_2,
        name1,
        name2,
        score1: duel.score_1,
        score2: duel.score_2,
        result: duel.result,
      };
    });

    // 3. Find Logged-In User's Duel and build side-by-side live match details
    const userDuel = formattedDuels.find((d) => d.userId1 === userId || d.userId2 === userId);
    let userDuelDetails: any = null;

    if (userDuel) {
      const rosterId1 = userDuel.rosterId1;
      const rosterId2 = userDuel.rosterId2;

      const fetchRosterPlayers = async (rosterId: string) => {
        if (!rosterId) return [];
        const { data: roster } = await supabaseAdmin
          .from("fantasy_rosters")
          .select("starters, manager_id")
          .eq("id", rosterId)
          .maybeSingle();

        if (!roster || !roster.starters || roster.starters.length === 0) return [];

        const { data: players } = await supabaseAdmin
          .from("team_rosters")
          .select("id, team_id, player_name, player_position, player_number, club")
          .in("id", roster.starters);

        // Fetch stage stats
        const { data: stats } = await supabaseAdmin
          .from("player_stage_stats")
          .select("*")
          .eq("stage", stage)
          .in("player_id", roster.starters);

        const statsMap: Record<string, any> = {};
        if (stats) {
          stats.forEach((s) => {
            statsMap[s.player_id] = s;
          });
        }

        return (players || []).map((p) => {
          const playerStats = statsMap[p.id];
          const pts = calculatePlayerPoints(playerStats, p.player_position);
          return {
            ...p,
            points: pts,
            events: getPlayerEvents(playerStats),
            stats: playerStats || null,
          };
        });
      };

      const starters1 = await fetchRosterPlayers(rosterId1 || "");
      const starters2 = await fetchRosterPlayers(rosterId2 || "");

      // Build live event ticker combined for both teams
      const tickerEvents: Array<{ time: string; player: string; event: string; team: 1 | 2 }> = [];
      starters1.forEach((p) => {
        p.events.forEach((ev: string) => {
          tickerEvents.push({ time: "Canlı", player: p.player_name, event: ev, team: 1 });
        });
      });
      starters2.forEach((p) => {
        p.events.forEach((ev: string) => {
          tickerEvents.push({ time: "Canlı", player: p.player_name, event: ev, team: 2 });
        });
      });

      userDuelDetails = {
        duelId: userDuel.id,
        team1: {
          name: userDuel.name1,
          rosterId: rosterId1,
          score: userDuel.score1,
          starters: starters1,
        },
        team2: {
          name: userDuel.name2,
          rosterId: rosterId2,
          score: userDuel.score2,
          starters: starters2,
        },
        ticker: tickerEvents,
      };
    }

    // 4. Calculate Common Mind XI (Statmatik Bot Team) Showcase
    let commonMindXI: any[] = [];
    const { data: allRosters } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("starters")
      .eq("stage", stage);

    if (allRosters && allRosters.length > 0) {
      const counts: Record<string, number> = {};
      allRosters.forEach((r) => {
        if (Array.isArray(r.starters)) {
          r.starters.forEach((id) => {
            counts[id] = (counts[id] || 0) + 1;
          });
        }
      });

      const playerIds = Object.keys(counts);
      if (playerIds.length > 0) {
        const { data: dbPlayers } = await supabaseAdmin
          .from("team_rosters")
          .select("id, team_id, player_name, player_position, player_number, club")
          .in("id", playerIds);

        if (dbPlayers) {
          const playersWithCounts = dbPlayers.map((p) => ({
            ...p,
            count: counts[p.id] || 0,
            genPos: getGeneralPosition(p.player_position),
          }));

          // Pick 4-4-2: 1 GK, 4 DEF, 4 MID, 2 FWD
          const gks = playersWithCounts.filter((p) => p.genPos === "GK").sort((a, b) => b.count - a.count);
          const defs = playersWithCounts.filter((p) => p.genPos === "DEF").sort((a, b) => b.count - a.count);
          const mids = playersWithCounts.filter((p) => p.genPos === "MID").sort((a, b) => b.count - a.count);
          const fwds = playersWithCounts.filter((p) => p.genPos === "FWD").sort((a, b) => b.count - a.count);

          commonMindXI = [
            ...gks.slice(0, 1),
            ...defs.slice(0, 4),
            ...mids.slice(0, 4),
            ...fwds.slice(0, 2),
          ];
        }
      }
    }

    // Fallback if not enough data to build Common Mind XI
    if (commonMindXI.length === 0) {
      const { data: fallbackPlayers } = await supabaseAdmin
        .from("team_rosters")
        .select("id, team_id, player_name, player_position, player_number, club")
        .limit(20);

      if (fallbackPlayers) {
        const mapped = fallbackPlayers.map((p) => ({
          ...p,
          genPos: getGeneralPosition(p.player_position),
        }));
        commonMindXI = [
          ...mapped.filter((p) => p.genPos === "GK").slice(0, 1),
          ...mapped.filter((p) => p.genPos === "DEF").slice(0, 4),
          ...mapped.filter((p) => p.genPos === "MID").slice(0, 4),
          ...mapped.filter((p) => p.genPos === "FWD").slice(0, 2),
        ];
      }
    }

    return NextResponse.json({
      success: true,
      stage,
      standings: standings || [],
      duels: formattedDuels,
      userDuel: userDuelDetails,
      commonMindXI,
      registeredTeams,
    });
  } catch (error: any) {
    console.error("GET duels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch duels data", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
export { calculatePlayerPoints, getGeneralPosition };
