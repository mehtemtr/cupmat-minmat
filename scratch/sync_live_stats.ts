import { supabaseAdmin } from "../lib/supabase";
import { generateGroupFixtures } from "../lib/fixtures";
import { generateSimulation } from "../lib/simulation";
import { calculatePlayerPoints, getGeneralPosition } from "../lib/fantasy/points";

// Current system time for syncing stats
const MOCK_CURRENT_TIME = Date.now();

// Helper to convert TSİ match time to UTC timestamp
function getMatchKickoff(dateStr: string, timeStr: string): number {
  const [hourStr, minStr] = timeStr.split(":");
  const [yrStr, moStr, dyStr] = dateStr.split("-");
  return new Date(Date.UTC(
    parseInt(yrStr, 10),
    parseInt(moStr, 10) - 1,
    parseInt(dyStr, 10),
    parseInt(hourStr, 10),
    parseInt(minStr, 10),
    0
  )).getTime() - (3 * 60 * 60 * 1000); // Base is TSİ (UTC+3)
}

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

async function run() {
  console.log("=== Running Live Match Sync to Supabase ===");
  console.log("Current Mock Time:", new Date(MOCK_CURRENT_TIME).toLocaleString("tr-TR"));

  // 1. Get all group fixtures
  const fixtures = generateGroupFixtures();
  
  // Filter fixtures that have started relative to MOCK_CURRENT_TIME
  const startedMatches = fixtures.filter(m => {
    const kickoff = getMatchKickoff(m.date, m.time || "12:00");
    return MOCK_CURRENT_TIME >= kickoff;
  });

  console.log(`Found ${startedMatches.length} started/completed matches.`);
  if (startedMatches.length === 0) {
    console.log("No matches have started yet.");
    return;
  }

  const stage = "matchday_1"; // we are focusing on matchday_1

  for (const match of startedMatches) {
    const kickoff = getMatchKickoff(match.date, match.time || "12:00");
    const elapsedMs = MOCK_CURRENT_TIME - kickoff;
    const isFinished = elapsedMs >= 120 * 60 * 1000;
    const elapsedMinutes = isFinished ? 94 : Math.min(94, Math.max(1, Math.floor(elapsedMs / 60000)));

    console.log(`Processing Match ${match.id}: ${match.homeTeamId} vs ${match.awayTeamId}`);
    console.log(`  Kickoff: ${match.date} ${match.time} (TSİ)`);
    console.log(`  Status: ${isFinished ? 'Finished' : 'Live'}, Elapsed: ${elapsedMinutes} mins`);

    // Fetch players for both teams from team_rosters
    const { data: homePlayers, error: hErr } = await supabaseAdmin
      .from("team_rosters")
      .select("*")
      .eq("team_id", match.homeTeamId);

    const { data: awayPlayers, error: aErr } = await supabaseAdmin
      .from("team_rosters")
      .select("*")
      .eq("team_id", match.awayTeamId);

    if (hErr || aErr || !homePlayers || !awayPlayers || homePlayers.length === 0 || awayPlayers.length === 0) {
      console.error(`  Error loading rosters for ${match.homeTeamId} or ${match.awayTeamId}:`, { hErr, aErr });
      continue;
    }

    // Run the deterministic simulation
    const events = generateSimulation(match, homePlayers, awayPlayers);
    const activeEvents = events.filter(e => e.minute <= elapsedMinutes);
    const scoreEvents = activeEvents.filter(e => e.scoreAfter);
    const finalScore = scoreEvents.length > 0 ? scoreEvents[scoreEvents.length - 1].scoreAfter : { home: 0, away: 0 };
    const homeGoals = finalScore?.home ?? 0;
    const awayGoals = finalScore?.away ?? 0;

    console.log(`  Simulated Score: ${homeGoals} - ${awayGoals}`);

    // Map positions helper
    // Map positions helper
    const getStarter11 = (players: any[], teamId: string) => {
      if (match.id === "A-1") {
        let starterIds: string[] = [];
        if (teamId === "mex") {
          starterIds = [
            "3b5c9749-c76d-4d48-8e9d-46a09eb933ea", // Guillermo Ochoa
            "d2cebdb2-8859-496c-9cc0-79bcc4f0601a", // César Montes
            "c5a3e47a-b756-4596-b8f8-eadd9a08fc1d", // Johan Vásquez
            "3519ded9-cf9a-4e70-9e4c-dd4b08d25525", // Jesús Gallardo
            "3d0994b5-4bd1-4072-a0bb-34a4c12013e9", // Jorge Sánchez
            "936ef0f7-d0c3-47f4-b800-8ed877588bf6", // Edson Álvarez
            "a4b2c7c2-a855-42f2-bb7c-9af4de4eacf0", // Luis Romo
            "8dd2867b-4eb1-4379-8838-787e8b5b2ee2", // Luis Chávez
            "5b9e5d7c-b6b9-426b-beb9-3458e1eb2b3f", // Orbelín Pineda
            "ddc7eb31-b167-4cff-af09-d60634badab4", // Raúl Jiménez
            "02c75abe-396a-4d19-b878-a5e3867d125d"  // Julián Quiñones
          ];
        } else if (teamId === "rsa") {
          starterIds = [
            "dfc2e4af-a47c-4073-9a80-730419bed478", // Ronwen Williams
            "722682a8-95a0-451b-bede-587e9b852773", // Aubrey Modiba
            "afe2e14b-07c7-42f4-83ec-4bf4614a4028", // Khuliso Mudau
            "49b6d45b-5e71-4e02-9e1d-11a59176b7af", // Thabang Matuludi
            "39a27d39-2c67-48e9-b56c-5ce3914760ba", // Nkosinathi Sibisi
            "16b6459d-5ecb-4d26-ba48-738deef36824", // Teboho Mokoena
            "9c675a1f-9097-4ebe-9d9d-651c9fbc38e7", // Jayden Adams
            "12082431-c39b-4f14-b8c9-c313be858ae1", // Yaya Sithole
            "33b26f3f-7377-4a7c-a65a-6f66c123c2e6", // Relebohile Mofokeng
            "7b3be35c-7c80-44ff-9351-b7b45c453e19", // Themba Zwane
            "b74fb591-440c-40d4-ad4e-b7ceca7ba0fd"  // Lyle Foster
          ];
        }
        const starters = players.filter(p => starterIds.includes(p.id));
        const bench = players.filter(p => !starterIds.includes(p.id));
        return { starters, bench };
      }

      const gks = players.filter(p => getGeneralPosition(p.player_position) === "GK").slice(0, 1);
      const defs = players.filter(p => getGeneralPosition(p.player_position) === "DEF").slice(0, 4);
      const mids = players.filter(p => getGeneralPosition(p.player_position) === "MID").slice(0, 4);
      const fwds = players.filter(p => getGeneralPosition(p.player_position) === "FWD").slice(0, 2);
      
      const starters = [...gks, ...defs, ...mids, ...fwds];
      const starterIds = new Set(starters.map(s => s.id));
      const bench = players.filter(p => !starterIds.has(p.id));
      return { starters, bench };
    };

    const homeSquad = getStarter11(homePlayers, match.homeTeamId);
    const awaySquad = getStarter11(awayPlayers, match.awayTeamId);

    // Initialize player stats map
    const statsMap: Record<string, any> = {};
    const initPlayerStats = (player: any, isStarter: boolean) => {
      statsMap[player.id] = {
        player_id: player.id,
        stage,
        minutes_played: isStarter ? elapsedMinutes : 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        clean_sheet: false,
        goals_conceded: 0,
        goal_difference: 0,
        own_goals: 0,
        saves: 0,
        penalty_saved: 0,
        penalty_missed: 0,
        penalty_earned: 0,
        penalty_conceded: 0,
        team_result: "draw"
      };
    };

    homePlayers.forEach(p => initPlayerStats(p, homeSquad.starters.some(s => s.id === p.id)));
    awayPlayers.forEach(p => initPlayerStats(p, awaySquad.starters.some(s => s.id === p.id)));

    // Process simulation events to extract stats
    activeEvents.forEach(ev => {
      if (ev.type === "goal") {
        const isOwnGoal = ev.textTr.includes("kendi kalesine") || ev.textEn.includes("own goal");
        if (isOwnGoal) {
          const ogPlayerName = ev.textTr.split("kendi kalesine gol atan oyuncu: ")[1]?.replace("!", "")?.trim() || 
                               ev.textEn.split("own goal by ")[1]?.replace("!", "")?.trim() || "";
          const ogPlayer = homePlayers.find(p => p.player_name.includes(ogPlayerName)) || 
                           awayPlayers.find(p => p.player_name.includes(ogPlayerName));
          if (ogPlayer && statsMap[ogPlayer.id]) {
            statsMap[ogPlayer.id].own_goals++;
            console.log(`    Own Goal: ${ogPlayer.player_name}`);
          }
        } else {
          // Find player by name in both teams
          const scorerName = ev.textTr.split("Golü atan oyuncu: ")[1]?.split(",")[0]?.replace("!", "")?.trim() || 
                             ev.textEn.split("Goal by ")[1]?.split(",")[0]?.replace("!", "")?.trim() || "";
          
          const scorer = homePlayers.find(p => p.player_name.includes(scorerName)) || 
                         awayPlayers.find(p => p.player_name.includes(scorerName));

          if (scorer && statsMap[scorer.id]) {
            statsMap[scorer.id].goals++;
            console.log(`    Goal Scorer: ${scorer.player_name}`);
          }

          // Parse assist
          const assistName = ev.textTr.split("Asisti yapan oyuncu: ")[1]?.replace("!", "")?.trim() || 
                             ev.textEn.split("Assist by ")[1]?.replace("!", "")?.trim() || "";
          if (assistName) {
            const assister = homePlayers.find(p => p.player_name.includes(assistName)) || 
                             awayPlayers.find(p => p.player_name.includes(assistName));
            if (assister && statsMap[assister.id]) {
              statsMap[assister.id].assists++;
              console.log(`    Assist: ${assister.player_name}`);
            }
          }
        }
      } else if (ev.type === "card") {
        const isRed = ev.textTr.includes("Kırmızı Kart") || ev.textEn.includes("Red Card") || ev.isRedCard;
        let bookedName = "";
        if (isRed) {
          bookedName = ev.textTr.split("Kırmızı Kart gören oyuncu: ")[1]?.replace(".", "")?.trim() || 
                       ev.textEn.split("Red Card for ")[1]?.replace(".", "")?.trim() || "";
        } else {
          bookedName = ev.textTr.split("Sarı Kart: ")[1]?.split(" rakibine")[0]?.trim() || 
                       ev.textEn.split("Yellow Card: ")[1]?.split(" receives")[0]?.trim() || "";
        }

        const booked = homePlayers.find(p => p.player_name.includes(bookedName)) || 
                       awayPlayers.find(p => p.player_name.includes(bookedName));

        if (booked && statsMap[booked.id]) {
          if (isRed) {
            statsMap[booked.id].red_cards++;
            // A red carded player only plays up to the card minute
            statsMap[booked.id].minutes_played = ev.minute;
            console.log(`    Red Card: ${booked.player_name} at minute ${ev.minute}`);
          } else {
            statsMap[booked.id].yellow_cards++;
            console.log(`    Yellow Card: ${booked.player_name}`);
          }
        }
      } else if (ev.type === "sub") {
        // substitution
        const outName = ev.textTr.split("oyuncu değişikliği. ")[1]?.split(" kenara")[0]?.trim() || "";
        const inName = ev.textTr.split("kenara gelirken ")[1]?.split(" oyuna")[0]?.trim() || "";

        const subOut = homePlayers.find(p => p.player_name.includes(outName)) || 
                       awayPlayers.find(p => p.player_name.includes(outName));
        const subIn = homePlayers.find(p => p.player_name.includes(inName)) || 
                      awayPlayers.find(p => p.player_name.includes(inName));

        if (subOut && statsMap[subOut.id]) {
          statsMap[subOut.id].minutes_played = ev.minute;
        }
        if (subIn && statsMap[subIn.id]) {
          statsMap[subIn.id].minutes_played = Math.max(0, elapsedMinutes - ev.minute);
        }
      }
    });

    // Post-process teams outcomes (clean sheets, goal outcomes, GK saves)
    const updateTeamOutcomes = (
      players: any[], 
      starters: any[], 
      ownGoalsConceded: number, 
      ownGoalsScored: number, 
      result: "win" | "draw" | "loss"
    ) => {
      const isCleanSheet = ownGoalsConceded === 0;
      const margin = ownGoalsScored - ownGoalsConceded;

      players.forEach(p => {
        const pStats = statsMap[p.id];
        if (!pStats || pStats.minutes_played === 0) return;

        const pos = getGeneralPosition(p.player_position);
        pStats.team_result = result;
        pStats.goal_difference = margin;

        if (pos === "GK" || pos === "DEF") {
          pStats.goals_conceded = ownGoalsConceded;
          if (isCleanSheet && pStats.minutes_played >= 60) {
            pStats.clean_sheet = true;
          }
        }
        if (pos === "GK") {
          // Give GKs some saves (e.g. 2-5 saves)
          pStats.saves = Math.floor(Math.random() * 4) + 2;
        }
      });
    };

    const homeResult = homeGoals > awayGoals ? "win" : homeGoals < awayGoals ? "loss" : "draw";
    const awayResult = homeGoals < awayGoals ? "win" : homeGoals > awayGoals ? "loss" : "draw";

    updateTeamOutcomes(homePlayers, homeSquad.starters, awayGoals, homeGoals, homeResult);
    updateTeamOutcomes(awayPlayers, awaySquad.starters, homeGoals, awayGoals, awayResult);

    // Clear old player stats for these teams in this stage before upserting new ones
    const playerIdsToClear = [...homePlayers, ...awayPlayers].map(p => p.id);
    console.log(`  Clearing old player stats for ${playerIdsToClear.length} players...`);
    const { error: deleteErr } = await supabaseAdmin
      .from("player_stage_stats")
      .delete()
      .eq("stage", stage)
      .in("player_id", playerIdsToClear);

    if (deleteErr) {
      console.error("  Error clearing old player stats:", deleteErr);
    }

    // Upsert player stage stats to Supabase
    const playerStatsArray = Object.values(statsMap).filter(s => s.minutes_played > 0 || s.goals > 0 || s.yellow_cards > 0 || s.red_cards > 0);
    console.log(`  Upserting ${playerStatsArray.length} player stats to player_stage_stats...`);

    const { error: upsertErr } = await supabaseAdmin
      .from("player_stage_stats")
      .upsert(playerStatsArray, { onConflict: "player_id, stage" });

    if (upsertErr) {
      console.error("  Error upserting player stats:", upsertErr);
    } else {
      console.log("  Player stats upserted successfully!");
    }

    // Upsert manager stats to manager_stage_stats
    const managerStats = [
      {
        manager_id: match.homeTeamId,
        stage,
        result: homeResult,
        goal_difference: homeGoals - awayGoals
      },
      {
        manager_id: match.awayTeamId,
        stage,
        result: awayResult,
        goal_difference: awayGoals - homeGoals
      }
    ];

    console.log("  Upserting manager stats...");
    const { error: mUpsertErr } = await supabaseAdmin
      .from("manager_stage_stats")
      .upsert(managerStats, { onConflict: "manager_id, stage" });

    if (mUpsertErr) {
      console.error("  Error upserting manager stats:", mUpsertErr);
    } else {
      console.log("  Manager stats upserted successfully!");
    }
  }

  // 3. Recalculate H2H Duels and standings
  console.log("Recalculating H2H Duel scores...");
  const { data: duels, error: duelsError } = await supabaseAdmin
    .from("fantasy_duels")
    .select("*")
    .eq("stage", stage);

  if (duelsError) throw duelsError;

  const { data: allRosters } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("*")
    .eq("stage", stage);

  const rosterMap = new Map<string, any>();
  const allPlayerIds = new Set<string>();
  const managerIds = new Set<string>();

  (allRosters || []).forEach((r) => {
    rosterMap.set(r.id, r);
    if (Array.isArray(r.starters)) {
      r.starters.forEach((id: string) => allPlayerIds.add(id));
    }
    if (r.manager_id) {
      managerIds.add(r.manager_id);
    }
  });

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

  for (const duel of duels || []) {
    const r1 = rosterMap.get(duel.roster_id_1);
    const r2 = rosterMap.get(duel.roster_id_2);

    let score1 = 0;
    let score2 = 0;

    if (r1 && Array.isArray(r1.starters)) {
      r1.starters.forEach((pid: string) => {
        const pos = playerPosMap.get(pid) || "Forvet";
        const stats = playerStatsMap.get(pid);
        score1 += calculatePlayerPoints(stats, pos);
      });

      if (r1.manager_id) {
        const mStats = managerStatsMap.get(r1.manager_id);
        score1 += calculateManagerPoints(mStats);
      }
    }

    if (r2 && Array.isArray(r2.starters)) {
      r2.starters.forEach((pid: string) => {
        const pos = playerPosMap.get(pid) || "Forvet";
        const stats = playerStatsMap.get(pid);
        score2 += calculatePlayerPoints(stats, pos);
      });

      if (r2.manager_id) {
        const mStats = managerStatsMap.get(r2.manager_id);
        score2 += calculateManagerPoints(mStats);
      }
    }

    let result: string | null = "draw";
    if (score1 > score2) result = "win_1";
    else if (score2 > score1) result = "win_2";

    console.log(`Duel ${duel.id}: ${r1?.team_name || 'Bot'} (${score1}) vs ${r2?.team_name || 'Bot'} (${score2}) -> Result: ${result}`);

    await supabaseAdmin
      .from("fantasy_duels")
      .update({
        score_1: score1,
        score_2: score2,
        result,
      })
      .eq("id", duel.id);

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

  // Re-aggregate standings
  console.log("Updating H2H Standings...");
  const { data: allDuels, error: allDuelsErr } = await supabaseAdmin
    .from("fantasy_duels")
    .select("*")
    .not("result", "is", null);

  if (allDuelsErr) throw allDuelsErr;

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
  let nicknameMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname")
      .in("user_id", userIds);

    if (profiles) {
      profiles.forEach((p) => {
        nicknameMap[p.user_id] = p.nickname;
      });
    }
  }

  for (const [userId, stats] of Object.entries(statsByUser)) {
    const nick = nicknameMap[userId] || "Katılımcı";
    const played = stats.won + stats.drawn + stats.lost;

    const payload = {
      user_id: userId,
      nickname: nick,
      played,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      points: stats.points,
      total_roster_points: stats.totalRosterPoints,
      updated_at: new Date().toISOString(),
    };

    await supabaseAdmin
      .from("fantasy_duel_standings")
      .upsert(payload, { onConflict: "user_id" });
  }

  console.log("=== Live Match Sync Complete! ===");
}

run();
