import { supabaseAdmin } from "../lib/supabase";
import { TEAMS } from "../data/teams";
import { calculatePlayerPoints } from "../lib/fantasy/points";
import * as fs from "fs";
import * as path from "path";

// Helper to normalize strings for name matching
const normalizeName = (name: string): string => {
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
};

// Parse match result from match string (e.g. "Güney Kore - Çekya 2 - 1")
function parseMatchResult(matchName: string, teamName: string): { team_result: "win" | "draw" | "loss"; goal_difference: number; goals_conceded: number } {
  const regex = /^(.*?)\s*-\s*(.*?)\s+(\d+)\s*-\s*(\d+)$/;
  const match = matchName.trim().match(regex);
  if (!match) {
    return { team_result: "draw", goal_difference: 0, goals_conceded: 0 };
  }
  
  const team1 = match[1].trim().toLowerCase();
  const team2 = match[2].trim().toLowerCase();
  const score1 = parseInt(match[3], 10);
  const score2 = parseInt(match[4], 10);
  
  const currentTeam = teamName.trim().toLowerCase();
  
  let isTeam1 = false;
  if (team1 === currentTeam || team1.includes(currentTeam) || currentTeam.includes(team1)) {
    isTeam1 = true;
  } else {
    isTeam1 = false;
  }
  
  const currentGoals = isTeam1 ? score1 : score2;
  const opponentGoals = isTeam1 ? score2 : score1;
  
  let team_result: "win" | "draw" | "loss" = "draw";
  if (currentGoals > opponentGoals) team_result = "win";
  else if (currentGoals < opponentGoals) team_result = "loss";
  
  return {
    team_result,
    goal_difference: currentGoals - opponentGoals,
    goals_conceded: opponentGoals
  };
}

async function main() {
  console.log("=== Running Player Stats Synchronization ===");

  const jsonPath = path.join(process.cwd(), "scratch/parsed_excel_stats.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: Parsed JSON file not found at ${jsonPath}. Run 'python scripts/parse_stats_excel.py' first.`);
    process.exit(1);
  }

  const parsedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // Build Turkish Team Name -> Team ID map
  const teamMap = new Map<string, string>();
  TEAMS.forEach((team) => {
    teamMap.set(normalizeName(team.nameTr), team.id.toLowerCase());
  });

  // Manual team mapping overrides (normalized without spaces)
  const teamOverrides: Record<string, string> = {
    "abd": "usa",
    "kongodc": "cod",
    "kongodemokratikcumhuriyeti": "cod",
    "yesilburun": "cpv",
    "yesilburunadalari": "cpv",
  };

  // Fetch all players from team_rosters database (paginated to load all players)
  console.log("Fetching all players from database...");
  const dbPlayers: any[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from("team_rosters")
      .select("*")
      .range(from, to);

    if (error) {
      console.error("Error loading team_rosters:", error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      dbPlayers.push(...data);
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

  console.log(`Loaded ${dbPlayers.length} players from database.`);

  // Index database players by:
  // 1. `${team_id}_${player_number}`
  // 2. `${team_id}_${normalizeName(player_name)}`
  const playerMapByNumber = new Map<string, any>();
  const playerMapByName = new Map<string, any>();

  dbPlayers.forEach((p) => {
    const tId = p.team_id.toLowerCase();
    if (p.player_number !== null && p.player_number !== undefined) {
      playerMapByNumber.set(`${tId}_${p.player_number}`, p);
    }
    playerMapByName.set(`${tId}_${normalizeName(p.player_name)}`, p);
  });

  let totalUpdated = 0;
  let totalFailed = 0;
  const unmatchedPlayers = new Set<string>();

  for (const stage of Object.keys(parsedData)) {
    console.log(`\nProcessing stage: ${stage}...`);
    const playersStats = parsedData[stage];
    const statsPayloadsBatch: any[] = [];
    const seenInStage = new Set<string>();
    
    for (const row of playersStats) {
      const normalizedTeamTr = normalizeName(row.team_name);
      
      // Check overrides or default map
      let teamId = teamOverrides[normalizedTeamTr] || teamMap.get(normalizedTeamTr);
      
      if (!teamId) {
        console.warn(`Warning: Could not map team name '${row.team_name}'`);
        totalFailed++;
        continue;
      }

      // Try matching by name first, then by number
      let player = playerMapByName.get(`${teamId}_${normalizeName(row.player_name)}`);
      if (!player) {
        // Try fallback on short name
        player = playerMapByName.get(`${teamId}_${normalizeName(row.player_short)}`);
      }
      if (!player) {
        player = playerMapByNumber.get(`${teamId}_${row.jersey_number}`);
      }

      if (!player) {
        unmatchedPlayers.add(`${row.team_name} - #${row.jersey_number} ${row.player_name} (${row.position})`);
        totalFailed++;
        continue;
      }

      // Prevent database conflict if duplicate rows are in Excel for the same player & stage
      const uniqueKey = `${player.id}_${stage}`;
      if (seenInStage.has(uniqueKey)) {
        console.warn(`Duplicate spreadsheet entry for player '${player.player_name}' in stage '${stage}'. Skipping duplicate.`);
        continue;
      }
      seenInStage.add(uniqueKey);

      // Parse match result outcome
      const outcome = parseMatchResult(row.match_name, row.team_name);

      // Determine clean sheet
      const cleanSheet = outcome.goals_conceded === 0;

      // Construct stats object for database insertion
      const statsPayload: any = {
        player_id: player.id,
        stage: stage,
        goals: row.goals || 0,
        assists: row.assists || 0,
        minutes_played: row.minutes_played || 0,
        team_result: outcome.team_result,
        goals_conceded: outcome.goals_conceded,
        goal_difference: outcome.goal_difference,
        clean_sheet: cleanSheet,
        saves: row.saves || 0,
        penalty_saved: row.penalty_saved || row.penalties_saved || 0,
        penalty_missed: row.penalty_missed || 0,
        own_goals: row.own_goals || 0,
        yellow_cards: row.yellow_cards || 0,
        red_cards: row.red_cards || 0
      };

      // Calculate fantasy points
      const points = calculatePlayerPoints(statsPayload, player.player_position);
      statsPayload.points = points;

      statsPayloadsBatch.push(statsPayload);
    }

    if (statsPayloadsBatch.length > 0) {
      console.log(`Bulk upserting ${statsPayloadsBatch.length} stats records into player_stage_stats...`);
      const chunkSize = 200;
      for (let i = 0; i < statsPayloadsBatch.length; i += chunkSize) {
        const chunk = statsPayloadsBatch.slice(i, i + chunkSize);
        
        let { error: upsertErr } = await supabaseAdmin
          .from("player_stage_stats")
          .upsert(chunk, { onConflict: "player_id,stage" });

        // Handle possible stale UUID mismatch if database player IDs were re-created on the fly
        if (upsertErr && upsertErr.code === "23503") {
          console.warn(`Foreign key violation in chunk starting at index ${i}. Reloading player rosters and retrying...`);
          
          // Fetch fresh rosters
          const freshPlayers = [];
          let fFrom = 0;
          let fTo = 999;
          let fHasMore = true;
          while (fHasMore) {
            const { data, error } = await supabaseAdmin.from("team_rosters").select("*").range(fFrom, fTo);
            if (error) break;
            if (data && data.length > 0) {
              freshPlayers.push(...data);
              if (data.length < 1000) fHasMore = false;
              else { fFrom += 1000; fTo += 1000; }
            } else { fHasMore = false; }
          }
          
          // Re-map chunk payloads using fresh players
          const freshMapByNumber = new Map<string, any>();
          const freshMapByName = new Map<string, any>();
          freshPlayers.forEach(p => {
            const tId = p.team_id.toLowerCase();
            if (p.player_number !== null && p.player_number !== undefined) {
              freshMapByNumber.set(`${tId}_${p.player_number}`, p);
            }
            freshMapByName.set(`${tId}_${normalizeName(p.player_name)}`, p);
          });
          
          // Re-build chunk
          const remappedChunk = [];
          const originalSourceRows = playersStats.slice(i, i + chunkSize);
          
          for (const row of originalSourceRows) {
            const normalizedTeamTr = normalizeName(row.team_name);
            let teamId = teamOverrides[normalizedTeamTr] || teamMap.get(normalizedTeamTr);
            if (!teamId) continue;
            
            let player = freshMapByName.get(`${teamId}_${normalizeName(row.player_name)}`);
            if (!player) player = freshMapByName.get(`${teamId}_${normalizeName(row.player_short)}`);
            if (!player) player = freshMapByNumber.get(`${teamId}_${row.jersey_number}`);
            if (!player) continue;
            
            const outcome = parseMatchResult(row.match_name, row.team_name);
            const cleanSheet = outcome.goals_conceded === 0;
            
            const statsPayload: any = {
              player_id: player.id,
              stage: stage,
              goals: row.goals || 0,
              assists: row.assists || 0,
              minutes_played: row.minutes_played || 0,
              team_result: outcome.team_result,
              goals_conceded: outcome.goals_conceded,
              goal_difference: outcome.goal_difference,
              clean_sheet: cleanSheet,
              saves: row.saves || 0,
              penalty_saved: row.penalty_saved || row.penalties_saved || 0,
              penalty_missed: row.penalty_missed || 0,
              own_goals: row.own_goals || 0,
              yellow_cards: row.yellow_cards || 0,
              red_cards: row.red_cards || 0
            };
            statsPayload.points = calculatePlayerPoints(statsPayload, player.player_position);
            remappedChunk.push(statsPayload);
          }
          
          // Retry upsert
          const { error: retryErr } = await supabaseAdmin
            .from("player_stage_stats")
            .upsert(remappedChunk, { onConflict: "player_id,stage" });
            
          if (retryErr) {
            console.error(`Retry failed for chunk starting at index ${i}:`, retryErr);
            totalFailed += chunk.length;
          } else {
            console.log(`Successfully self-healed and upserted chunk starting at index ${i}.`);
            totalUpdated += remappedChunk.length;
          }
        } else if (upsertErr) {
          console.error(`Error bulk upserting stats chunk starting at index ${i}:`, upsertErr);
          totalFailed += chunk.length;
        } else {
          totalUpdated += chunk.length;
        }
      }
    }
  }

  console.log("\n=== Synchronization Summary ===");
  console.log(`Successfully updated: ${totalUpdated} player records.`);
  console.log(`Failed/Unmatched: ${totalFailed} records.`);

  if (unmatchedPlayers.size > 0) {
    console.warn("\nUnmatched Players List (Jersey/Name mismatches):");
    Array.from(unmatchedPlayers).forEach((up) => console.warn(` - ${up}`));
  }
}

main().catch((err) => {
  console.error("Unhandled execution error:", err);
  process.exit(1);
});
