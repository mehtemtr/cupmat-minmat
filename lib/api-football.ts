import { supabaseAdmin } from "./supabase";
import { TEAMS } from "@/data/teams";
import { calculatePlayerPoints, getGeneralPosition } from "./fantasy/points";
import { generateGroupFixtures } from "./fixtures";
import { generateSimulation } from "./simulation";
import { getAdjustedTime } from "./tournament/time-helper";

// Get list of API keys from env
const getApiKeys = (): string[] => {
  const raw = process.env.API_FOOTBALL_KEY || "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
};

// Make API request with key rotation fallback
async function fetchFromApi(endpoint: string): Promise<any> {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error("No API_FOOTBALL_KEY defined in environment variables.");
  }

  let lastError: any = null;

  // Try each key one by one in case of failure or rate limits (429)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const headers: Record<string, string> = {
      "x-apisports-key": key,
    };

    const url = `https://v3.football.api-sports.io/${endpoint}`;
    console.log(`[API-Football] Querying endpoint with Key ${i + 1}/${keys.length}: ${endpoint}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        next: { revalidate: 0 }, // Disable Next.js fetch cache
      });

      if (response.status === 429) {
        console.warn(`[API-Football] Key ${i + 1} returned 429 (Rate Limit). Trying next key...`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API-sports sometimes returns error list in body
      if (data.errors && !Array.isArray(data.errors) && Object.keys(data.errors).length > 0) {
        const errorMsg = JSON.stringify(data.errors);
        console.warn(`[API-Football] Key ${i + 1} returned API errors: ${errorMsg}. Trying next key...`);
        lastError = new Error(errorMsg);
        continue;
      }

      return data;
    } catch (err: any) {
      console.error(`[API-Football] Key ${i + 1} failed:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All API keys failed to execute request.");
}

// Map API-Football team to our database team ID
export function getLocalTeamId(apiTeam: { name: string; code?: string }): string | null {
  const apiCode = (apiTeam.code || "").toLowerCase().trim();
  const apiName = apiTeam.name.toLowerCase().trim();

  // Try matching by 3-letter code
  if (apiCode) {
    const match = TEAMS.find((t) => t.id === apiCode);
    if (match) return match.id;
  }

  // Try matching by English name
  const matchByName = TEAMS.find(
    (t) =>
      t.nameEn.toLowerCase() === apiName ||
      t.nameEn.toLowerCase().includes(apiName) ||
      apiName.includes(t.nameEn.toLowerCase())
  );
  if (matchByName) return matchByName.id;

  // Special names mapping (fallbacks)
  if (apiName.includes("korea") || apiName.includes("south korea")) return "kor";
  if (apiName.includes("czech") || apiName.includes("czechia")) return "cze";
  if (apiName.includes("usa") || apiName.includes("united states")) return "usa";
  if (apiName.includes("saudi")) return "ksa";

  return null;
}

// Find best matching player in team rosters (fuzzy text similarity)
export function findBestPlayerMatch(apiName: string, dbPlayers: any[]): any | null {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]/g, "") // alphanumeric only
      .trim();

  const cleanApi = clean(apiName);
  if (!cleanApi) return null;

  // 1. Exact clean match
  let match = dbPlayers.find((p) => clean(p.player_name) === cleanApi);
  if (match) return match;

  // 2. Substring match
  match = dbPlayers.find(
    (p) =>
      clean(p.player_name).includes(cleanApi) ||
      cleanApi.includes(clean(p.player_name))
  );
  if (match) return match;

  // 3. Last name matching (e.g. "H. Son" -> "Son Heung-min")
  const apiParts = apiName.split(" ").filter((p) => p.length > 0);
  const apiLastName = clean(apiParts[apiParts.length - 1] || "");

  if (apiLastName.length > 2) {
    const matchesByLastName = dbPlayers.filter((p) => {
      const dbParts = p.player_name.split(" ").filter((pt: string) => pt.length > 0);
      const dbLastName = clean(dbParts[dbParts.length - 1] || "");
      return dbLastName === apiLastName;
    });

    if (matchesByLastName.length === 1) {
      return matchesByLastName[0];
    }
  }

  return null;
}

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
  )).getTime() - (3 * 60 * 60 * 1000); // TSİ (UTC+3) to UTC
}

function getMatchesForStage(stage: string, allMatches: any[]): any[] {
  return allMatches.filter((m) => {
    const dateStr = m.date;
    if (!dateStr) return false;
    if (stage === "matchday_1") {
      return dateStr >= "2026-06-08" && dateStr <= "2026-06-12";
    } else if (stage === "matchday_2") {
      return dateStr >= "2026-06-13" && dateStr <= "2026-06-17";
    } else if (stage === "matchday_3") {
      return dateStr >= "2026-06-18" && dateStr <= "2026-06-22";
    } else if (stage === "round_of_32") {
      return dateStr >= "2026-06-23" && dateStr <= "2026-06-26";
    } else if (stage === "round_of_16") {
      return dateStr >= "2026-06-27" && dateStr <= "2026-06-30";
    } else if (stage === "quarter_finals") {
      return dateStr >= "2026-07-01" && dateStr <= "2026-07-04";
    } else if (stage === "semi_finals") {
      return dateStr >= "2026-07-05" && dateStr <= "2026-07-08";
    } else if (stage === "finals") {
      return dateStr >= "2026-07-09";
    }
    return false;
  });
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

export async function syncSimulatedScores(stage: string): Promise<string[]> {
  const logs: string[] = [];
  logs.push(`[Simulation-Sync] Starting fallback simulation-based sync for Stage ${stage}...`);

  const fixtures = generateGroupFixtures();
  const stageMatches = getMatchesForStage(stage, fixtures);

  if (stageMatches.length === 0) {
    logs.push(`[Simulation-Sync] No fixtures found for Stage ${stage}.`);
    return logs;
  }

  const { data: dbRosters } = await supabaseAdmin.from("team_rosters").select("*");
  if (!dbRosters || dbRosters.length === 0) {
    throw new Error("No rosters found in database (team_rosters).");
  }

  const MOCK_CURRENT_TIME = getAdjustedTime();

  // Fetch real scores from Football-Data.org API to align simulated scorers/cards
  const fdToken = process.env.FOOTBALL_DATA_TOKEN || "";
  let liveMatches: any[] = [];
  if (fdToken) {
    try {
      const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
        headers: { "X-Auth-Token": fdToken }
      });
      if (res.ok) {
        const data = await res.json();
        liveMatches = data.matches || [];
        logs.push(`[Simulation-Sync] Successfully loaded ${liveMatches.length} real scores from Football-Data.org API.`);
      } else {
        logs.push(`[Simulation-Sync] Football-Data.org API returned status: ${res.status}`);
      }
    } catch (e: any) {
      logs.push(`[Simulation-Sync] Failed to fetch real scores: ${e.message}`);
    }
  }

  const startedMatches = stageMatches.filter(m => {
    const kickoff = getMatchKickoff(m.date, m.time || "12:00");
    return MOCK_CURRENT_TIME >= kickoff;
  });

  // Merge real scores from liveMatches
  startedMatches.forEach(m => {
    const apiMatch = liveMatches.find((lm: any) => {
      const apiHomeTla = (lm.homeTeam.tla || "").toLowerCase().trim();
      const apiAwayTla = (lm.awayTeam.tla || "").toLowerCase().trim();
      const homeTla = apiHomeTla === "hai" ? "hti" : (apiHomeTla === "ury" ? "uru" : apiHomeTla);
      const awayTla = apiAwayTla === "hai" ? "hti" : (apiAwayTla === "ury" ? "uru" : apiAwayTla);
      return homeTla === m.homeTeamId && awayTla === m.awayTeamId;
    });

    if (apiMatch) {
      const status = apiMatch.status;
      const played = status === "FINISHED";
      const isLive = ["IN_PLAY", "PAUSED"].includes(status);
      if (played || isLive) {
        m.homeScore = apiMatch.score.fullTime.home;
        m.awayScore = apiMatch.score.fullTime.away;
        m.played = played;
        m.isLive = isLive;
        logs.push(`[Simulation-Sync] Match ${m.id} mapped to real score: ${m.homeScore} - ${m.awayScore} (status: ${status})`);
      }
    }
  });

  logs.push(`[Simulation-Sync] Found ${startedMatches.length}/${stageMatches.length} matches started/completed.`);

  for (const match of startedMatches) {
    const kickoff = getMatchKickoff(match.date, match.time || "12:00");
    const elapsedMs = MOCK_CURRENT_TIME - kickoff;
    const isFinished = elapsedMs >= 120 * 60 * 1000;
    const elapsedMinutes = isFinished ? 94 : Math.min(94, Math.max(1, Math.floor(elapsedMs / 60000)));

    logs.push(`[Simulation-Sync] Processing Match ${match.id}: ${match.homeTeamId} vs ${match.awayTeamId} (${elapsedMinutes} mins)`);

    const homePlayers = dbRosters.filter(r => r.team_id === match.homeTeamId);
    const awayPlayers = dbRosters.filter(r => r.team_id === match.awayTeamId);

    if (homePlayers.length === 0 || awayPlayers.length === 0) {
      logs.push(`[Simulation-Sync] Missing rosters for teams ${match.homeTeamId} or ${match.awayTeamId}.`);
      continue;
    }

    const events = generateSimulation(match, homePlayers, awayPlayers);
    const activeEvents = events.filter(e => e.minute <= elapsedMinutes);
    const scoreEvents = activeEvents.filter(e => e.scoreAfter);
    const finalScore = scoreEvents.length > 0 ? scoreEvents[scoreEvents.length - 1].scoreAfter : { home: 0, away: 0 };
    const homeGoals = finalScore?.home ?? 0;
    const awayGoals = finalScore?.away ?? 0;

    const statsMap: Record<string, any> = {};

    const getStarter11 = (players: any[]) => {
      const gks = players.filter(p => getGeneralPosition(p.player_position) === "GK").slice(0, 1);
      const defs = players.filter(p => getGeneralPosition(p.player_position) === "DEF").slice(0, 4);
      const mids = players.filter(p => getGeneralPosition(p.player_position) === "MID").slice(0, 4);
      const fwds = players.filter(p => getGeneralPosition(p.player_position) === "FWD").slice(0, 2);
      const starters = [...gks, ...defs, ...mids, ...fwds];
      const starterIds = new Set(starters.map(s => s.id));
      const bench = players.filter(p => !starterIds.has(p.id));
      return { starters, bench };
    };

    const homeSquad = getStarter11(homePlayers);
    const awaySquad = getStarter11(awayPlayers);

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

    activeEvents.forEach(ev => {
      if (ev.type === "goal") {
        const scorerName = ev.textTr.split("Golü atan oyuncu: ")[1]?.replace("!", "")?.trim() || 
                           ev.textEn.split("Goal by ")[1]?.replace("!", "")?.trim() || "";
        const scorer = homePlayers.find(p => p.player_name.includes(scorerName)) || 
                       awayPlayers.find(p => p.player_name.includes(scorerName));
        if (scorer && statsMap[scorer.id]) {
          statsMap[scorer.id].goals++;
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
            statsMap[booked.id].minutes_played = ev.minute;
          } else {
            statsMap[booked.id].yellow_cards++;
          }
        }
      } else if (ev.type === "sub") {
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

    const updateTeamOutcomes = (
      players: any[], 
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
          pStats.saves = Math.floor(Math.random() * 4) + 2;
        }
      });
    };

    const homeResult = homeGoals > awayGoals ? "win" : homeGoals < awayGoals ? "loss" : "draw";
    const awayResult = homeGoals < awayGoals ? "win" : homeGoals > awayGoals ? "loss" : "draw";

    updateTeamOutcomes(homePlayers, awayGoals, homeGoals, homeResult);
    updateTeamOutcomes(awayPlayers, homeGoals, awayGoals, awayResult);

    const playerIdsToClear = [...homePlayers, ...awayPlayers].map(p => p.id);
    await supabaseAdmin
      .from("player_stage_stats")
      .delete()
      .eq("stage", stage)
      .in("player_id", playerIdsToClear);

    const playerStatsArray = Object.values(statsMap).filter(s => s.minutes_played > 0 || s.goals > 0 || s.yellow_cards > 0 || s.red_cards > 0);
    
    playerStatsArray.forEach((ps) => {
      const playerInfo = dbRosters.find((r) => r.id === ps.player_id);
      ps.points = calculatePlayerPoints(ps, playerInfo?.player_position || "MID");
    });

    if (playerStatsArray.length > 0) {
      const { error: upsertErr } = await supabaseAdmin
        .from("player_stage_stats")
        .upsert(playerStatsArray, { onConflict: "player_id, stage" });
      if (upsertErr) {
        logs.push(`[Simulation-Sync] Error saving player stats: ${upsertErr.message}`);
      }
    }

    const homeManagerPoints = calculateManagerPoints({ result: homeResult, goal_difference: homeGoals - awayGoals });
    const awayManagerPoints = calculateManagerPoints({ result: awayResult, goal_difference: awayGoals - homeGoals });

    const managerStats = [
      {
        manager_id: match.homeTeamId,
        stage,
        result: homeResult,
        goal_difference: homeGoals - awayGoals,
        points: homeManagerPoints
      },
      {
        manager_id: match.awayTeamId,
        stage,
        result: awayResult,
        goal_difference: awayGoals - homeGoals,
        points: awayManagerPoints
      }
    ];

    const { error: mUpsertErr } = await supabaseAdmin
      .from("manager_stage_stats")
      .upsert(managerStats, { onConflict: "manager_id, stage" });

    if (mUpsertErr) {
      logs.push(`[Simulation-Sync] Error saving manager stats: ${mUpsertErr.message}`);
    }
  }

  logs.push(`[Simulation-Sync] Fallback simulation sync complete for Stage ${stage}!`);
  return logs;
}

// Sync scores and stats for today's active or finished matches
export async function syncApiFootballScores(stage = "matchday_1"): Promise<string[]> {
  const logs: string[] = [];
  logs.push("Starting API-Football Synchronization...");

  try {
    // 1. Fetch World Cup 2026 matches list from API-Football
    // League ID 1 is FIFA World Cup, season 2026
    const fixturesData = await fetchFromApi("fixtures?league=1&season=2026");
    const apiFixtures = fixturesData.response || [];

    logs.push(`Found ${apiFixtures.length} matches in API-Football World Cup 2026.`);

    // Load all matches from local database or definition to map them
    const { data: dbRosters } = await supabaseAdmin.from("team_rosters").select("*");
    if (!dbRosters || dbRosters.length === 0) {
      throw new Error("No player rosters found in database (team_rosters).");
    }

    // Filter for matches that are currently live or finished
    // Status: FT (Finished), HT (Halftime), 1H (First Half), 2H (Second Half), AET (Extra Time), PEN (Penalties)
    const activeOrFinished = apiFixtures.filter((f: any) => {
      const status = f.fixture.status.short;
      return ["FT", "HT", "1H", "2H", "AET", "PEN", "LIVE"].includes(status);
    });

    logs.push(`Found ${activeOrFinished.length} active or finished matches today.`);

    for (const apiFixture of activeOrFinished) {
      const fixtureId = apiFixture.fixture.id;
      const status = apiFixture.fixture.status.short;

      const homeLocalId = getLocalTeamId(apiFixture.teams.home);
      const awayLocalId = getLocalTeamId(apiFixture.teams.away);

      if (!homeLocalId || !awayLocalId) {
        logs.push(
          `Skipped Match ${fixtureId} (${apiFixture.teams.home.name} vs ${apiFixture.teams.away.name}): could not map teams.`
        );
        continue;
      }

      logs.push(
        `Syncing Match ${fixtureId} [${status}]: ${homeLocalId} vs ${awayLocalId} (Score: ${apiFixture.goals.home} - ${apiFixture.goals.away})`
      );

      // Get team rosters from database for matching
      const homePlayers = dbRosters.filter((r) => r.team_id === homeLocalId);
      const awayPlayers = dbRosters.filter((r) => r.team_id === awayLocalId);

      // 2. Fetch detailed player stats for this fixture
      // Endpoint: fixtures/players?fixture={fixtureId}
      const playersStatsData = await fetchFromApi(`fixtures/players?fixture=${fixtureId}`);
      const teamStatsList = playersStatsData.response || [];

      const statsMap: Record<string, any> = {};

      // Helper to initialize database record structure
      const initPlayerRecord = (player: any, minsPlayed: number) => {
        statsMap[player.id] = {
          player_id: player.id,
          stage,
          minutes_played: minsPlayed,
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
          team_result: "draw",
        };
      };

      // Process each team's players from API
      for (const teamStats of teamStatsList) {
        const isHome = getLocalTeamId(teamStats.team) === homeLocalId;
        const localTeamId = isHome ? homeLocalId : awayLocalId;
        const dbTeamPlayers = isHome ? homePlayers : awayPlayers;

        const apiPlayers = teamStats.players || [];

        for (const apiPlayerStat of apiPlayers) {
          const apiPlayerName = apiPlayerStat.player.name;
          const matchedDbPlayer = findBestPlayerMatch(apiPlayerName, dbTeamPlayers);

          if (!matchedDbPlayer) {
            // Log unmatched players for debugging (ignore minor subs)
            const mins = apiPlayerStat.statistics?.[0]?.games?.minutes || 0;
            if (mins > 0) {
              console.warn(`[API-Football] Could not map player "${apiPlayerName}" of team "${localTeamId}"`);
            }
            continue;
          }

          const apiStats = apiPlayerStat.statistics?.[0] || {};
          const minsPlayed = apiStats.games?.minutes || 0;

          // Only process players who actually got minutes or goals/cards
          if (minsPlayed > 0 || apiStats.goals?.total > 0 || apiStats.cards?.yellow > 0 || apiStats.cards?.red > 0) {
            initPlayerRecord(matchedDbPlayer, minsPlayed);
            const rec = statsMap[matchedDbPlayer.id];

            rec.goals = apiStats.goals?.total || 0;
            rec.assists = apiStats.goals?.assists || 0;
            rec.yellow_cards = apiStats.cards?.yellow || 0;
            rec.red_cards = apiStats.cards?.red || 0;
            rec.own_goals = apiStats.goals?.conceded || 0; // own goals conceded
            rec.saves = apiStats.goals?.saves || 0;
            
            rec.penalty_saved = apiStats.penalty?.saved || 0;
            rec.penalty_missed = apiStats.penalty?.missed || 0;
            rec.penalty_earned = apiStats.penalty?.won || 0;
            rec.penalty_conceded = apiStats.penalty?.commited || 0;
          }
        }
      }

      // 3. Post-process clean sheets, goal differences and results
      const homeGoals = apiFixture.goals.home ?? 0;
      const awayGoals = apiFixture.goals.away ?? 0;

      const homeResult = homeGoals > awayGoals ? "win" : homeGoals < awayGoals ? "loss" : "draw";
      const awayResult = homeGoals < awayGoals ? "win" : homeGoals > awayGoals ? "loss" : "draw";

      const updateTeamPStats = (teamPlayers: any[], ownConceded: number, ownScored: number, res: "win" | "draw" | "loss") => {
        const isCleanSheet = ownConceded === 0;
        const margin = ownScored - ownConceded;

        teamPlayers.forEach((p) => {
          const rec = statsMap[p.id];
          if (!rec) return;

          rec.team_result = res;
          rec.goal_difference = margin;

          const pos = getGeneralPosition(p.player_position);
          if (pos === "GK" || pos === "DEF") {
            rec.goals_conceded = ownConceded;
            if (isCleanSheet && rec.minutes_played >= 60) {
              rec.clean_sheet = true;
            }
          }
        });
      };

      updateTeamPStats(homePlayers, awayGoals, homeGoals, homeResult);
      updateTeamPStats(awayPlayers, homeGoals, awayGoals, awayResult);

      // 4. Clear and Upsert player stats in Supabase
      const playerIdsToClear = [...homePlayers, ...awayPlayers].map((p) => p.id);
      await supabaseAdmin
        .from("player_stage_stats")
        .delete()
        .eq("stage", stage)
        .in("player_id", playerIdsToClear);

      const playerStatsArray = Object.values(statsMap);
      
      // Calculate points
      playerStatsArray.forEach((ps) => {
        const playerInfo = dbRosters.find((r) => r.id === ps.player_id);
        ps.points = calculatePlayerPoints(ps, playerInfo?.player_position || "MID");
      });

      if (playerStatsArray.length > 0) {
        const { error: upsertErr } = await supabaseAdmin
          .from("player_stage_stats")
          .upsert(playerStatsArray, { onConflict: "player_id, stage" });

        if (upsertErr) {
          logs.push(`Error saving player stats for Match ${fixtureId}: ${upsertErr.message}`);
        } else {
          logs.push(`Successfully synced stats for ${playerStatsArray.length} players in Match ${fixtureId}.`);
        }
      }

      // Upsert manager stats
      const homeManagerPoints = calculateManagerPoints({ result: homeResult, goal_difference: homeGoals - awayGoals });
      const awayManagerPoints = calculateManagerPoints({ result: awayResult, goal_difference: awayGoals - homeGoals });

      const managerStats = [
        {
          manager_id: homeLocalId,
          stage,
          result: homeResult,
          goal_difference: homeGoals - awayGoals,
          points: homeManagerPoints
        },
        {
          manager_id: awayLocalId,
          stage,
          result: awayResult,
          goal_difference: awayGoals - homeGoals,
          points: awayManagerPoints
        }
      ];

      await supabaseAdmin
        .from("manager_stage_stats")
        .upsert(managerStats, { onConflict: "manager_id, stage" });
    }
  } catch (err: any) {
    logs.push(`API-Football fetch failed: ${err.message || String(err)}. Falling back to simulation-based sync...`);
    const simLogs = await syncSimulatedScores(stage);
    logs.push(...simLogs);
  }

  logs.push("API-Football Synchronization complete!");
  return logs;
}
