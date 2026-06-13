import { supabaseAdmin } from "../lib/supabase";
import { calculatePlayerPoints, getGeneralPosition } from "../lib/fantasy/points";

function calculateManagerPoints(stats: any): number {
  if (!stats) return 0;
  let pts = 0;
  if (stats.result === "win") {
    pts += 5;
    if ((stats.goal_difference || 0) >= 3) {
      pts += 2;
    }
  } else if (stats.result === "draw") {
    pts += 2;
  } else if (stats.result === "loss") {
    pts -= 2;
    if ((stats.goal_difference || 0) <= -3) {
      pts -= 2;
    }
  }
  return pts;
}

async function recalculateStage(stage: string) {
  console.log(`\n--- Recalculating Stage: ${stage} ---`);

  // 1. Fetch all duels
  const { data: duels, error: duelsError } = await supabaseAdmin
    .from("fantasy_duels")
    .select("*")
    .eq("stage", stage);

  if (duelsError) throw duelsError;
  console.log(`Found ${duels?.length || 0} duels.`);

  // 2. Fetch all rosters
  const { data: rosters, error: rostersError } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("*")
    .eq("stage", stage);

  if (rostersError) throw rostersError;

  const rosterMap = new Map<string, any>();
  const allPlayerIds = new Set<string>();
  const managerIds = new Set<string>();

  rosters.forEach((r) => {
    rosterMap.set(r.id, r);
    if (Array.isArray(r.starters)) {
      r.starters.forEach((id: string) => allPlayerIds.add(id));
    }
    if (r.manager_id) {
      managerIds.add(r.manager_id);
    }
  });

  // Load player positions
  const playerPosMap = new Map<string, string>();
  if (allPlayerIds.size > 0) {
    const { data: players } = await supabaseAdmin
      .from("team_rosters")
      .select("id, player_position")
      .in("id", Array.from(allPlayerIds));

    if (players) {
      players.forEach((p) => playerPosMap.set(p.id, p.player_position));
    }
  }

  // Load player stats
  const playerStatsMap = new Map<string, any>();
  if (allPlayerIds.size > 0) {
    const { data: stats } = await supabaseAdmin
      .from("player_stage_stats")
      .select("*")
      .eq("stage", stage)
      .in("player_id", Array.from(allPlayerIds));

    if (stats) {
      stats.forEach((s) => playerStatsMap.set(s.player_id, s));
    }
  }

  // Load manager stats
  const managerStatsMap = new Map<string, any>();
  if (managerIds.size > 0) {
    const { data: mStats } = await supabaseAdmin
      .from("manager_stage_stats")
      .select("*")
      .eq("stage", stage)
      .in("manager_id", Array.from(managerIds));

    if (mStats) {
      mStats.forEach((s) => managerStatsMap.set(s.manager_id, s));
    }
  }

  // Process duels
  for (const duel of duels || []) {
    const r1 = rosterMap.get(duel.roster_id_1);
    const r2 = rosterMap.get(duel.roster_id_2);

    let score1 = 0;
    let score2 = 0;

    // Roster 1 players
    if (r1 && Array.isArray(r1.starters)) {
      r1.starters.forEach((pid: string) => {
        const pos = playerPosMap.get(pid) || "Forvet";
        const stats = playerStatsMap.get(pid);
        score1 += calculatePlayerPoints(stats, pos);
      });
      // Manager
      if (r1.manager_id) {
        const mStats = managerStatsMap.get(r1.manager_id);
        score1 += calculateManagerPoints(mStats);
      }
    }

    // Roster 2 players
    if (r2 && Array.isArray(r2.starters)) {
      r2.starters.forEach((pid: string) => {
        const pos = playerPosMap.get(pid) || "Forvet";
        const stats = playerStatsMap.get(pid);
        score2 += calculatePlayerPoints(stats, pos);
      });
      // Manager
      if (r2.manager_id) {
        const mStats = managerStatsMap.get(r2.manager_id);
        score2 += calculateManagerPoints(mStats);
      }
    }

    let result = "draw";
    if (score1 > score2) result = "win_1";
    else if (score2 > score1) result = "win_2";

    console.log(` - Duel ${duel.id}: ${r1?.team_name || 'Bot'} (${score1}) vs ${r2?.team_name || 'Bot'} (${score2}) -> Result: ${result}`);

    // Update in DB
    await supabaseAdmin
      .from("fantasy_duels")
      .update({
        score_1: score1,
        score_2: score2,
        result,
      })
      .eq("id", duel.id);

    // Update rosters
    if (r1) {
      await supabaseAdmin
        .from("fantasy_rosters")
        .update({ points: score1 })
        .eq("id", r1.id);
    }
    if (r2) {
      await supabaseAdmin
        .from("fantasy_rosters")
        .update({ points: score2 })
        .eq("id", r2.id);
    }
  }
}

async function rebuildStandings() {
  console.log("\n--- Rebuilding standings table ---");
  const { data: allDuels, error: duelsErr } = await supabaseAdmin
    .from("fantasy_duels")
    .select("*")
    .not("result", "is", null);

  if (duelsErr) throw duelsErr;

  const statsByUser: Record<
    string,
    { won: number; drawn: number; lost: number; points: number; totalRosterPoints: number }
  > = {};

  const incrementUserStats = (userId: string, isWin: boolean, isDraw: boolean, rosterPoints: number) => {
    if (!statsByUser[userId]) {
      statsByUser[userId] = { won: 0, drawn: 0, lost: 0, points: 0, totalRosterPoints: 0 };
    }
    const s = statsByUser[userId];
    s.totalRosterPoints += rosterPoints;
    if (isWin) {
      s.won += 1;
      s.points += 3;
    } else if (isDraw) {
      s.drawn += 1;
      s.points += 1;
    } else {
      s.lost += 1;
    }
  };

  allDuels.forEach((duel) => {
    const u1 = duel.user_id_1;
    const u2 = duel.user_id_2;

    const res = duel.result;
    const score1 = duel.score_1 || 0;
    const score2 = duel.score_2 || 0;

    if (u1) {
      incrementUserStats(u1, res === "win_1", res === "draw", score1);
    }
    if (u2) {
      incrementUserStats(u2, res === "win_2", res === "draw", score2);
    }
  });

  const userIds = Object.keys(statsByUser);
  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname")
      .in("user_id", userIds);

    const nicknameMap = new Map<string, string>();
    if (profiles) {
      profiles.forEach((p) => nicknameMap.set(p.user_id, p.nickname || "Katılımcı"));
    }

    for (const uId of userIds) {
      const stats = statsByUser[uId];
      const nickname = nicknameMap.get(uId) || "Katılımcı";

      await supabaseAdmin.from("fantasy_duel_standings").upsert({
        user_id: uId,
        nickname,
        played: stats.won + stats.drawn + stats.lost,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        points: stats.points,
        total_roster_points: stats.totalRosterPoints,
        updated_at: new Date().toISOString(),
      });
    }
    console.log(`Successfully updated standings for ${userIds.length} users.`);
  }
}

async function main() {
  try {
    await recalculateStage("matchday_1");
    await recalculateStage("matchday_2");
    await rebuildStandings();
    console.log("\nAll stages recalculated and standings successfully rebuilt!");
  } catch (err) {
    console.error("Main execution failed:", err);
  }
}

main();
