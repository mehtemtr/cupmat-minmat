import { supabaseAdmin } from "./supabase";
import { TEAMS } from "@/data/teams";
import { calculatePlayerPoints, getGeneralPosition } from "./fantasy/points";

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

// Sync scores and stats for today's active or finished matches
export async function syncApiFootballScores(stage = "matchday_1"): Promise<string[]> {
  const logs: string[] = [];
  logs.push("Starting API-Football Synchronization...");

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
  }

  logs.push("API-Football Synchronization complete!");
  return logs;
}
