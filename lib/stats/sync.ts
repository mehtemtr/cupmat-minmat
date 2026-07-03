import { supabaseAdmin } from "@/lib/supabase";
import { TEAMS } from "@/data/teams";
import { calculatePlayerPoints } from "@/lib/fantasy/points";
import fs from "fs";
import path from "path";

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

export async function runPlayerStatsSync() {
  console.log("=== Running Dynamic Player Stats Synchronization ===");

  const jsonPath = path.join(process.cwd(), "scratch/parsed_excel_stats.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Parsed JSON file not found at ${jsonPath}`);
  }

  const parsedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // Build Turkish Team Name -> Team ID map
  const teamMap = new Map<string, string>();
  TEAMS.forEach((team) => {
    teamMap.set(normalizeName(team.nameTr), team.id.toLowerCase());
  });

  // Manual team mapping overrides
  const teamOverrides: Record<string, string> = {
    "abd": "usa",
    "kongodc": "cod",
    "kongodemokratikcumhuriyeti": "cod",
    "yesilburun": "cpv",
    "yesilburunadalari": "cpv",
  };

  // Fetch all players from team_rosters database
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
      throw new Error(`Error loading team_rosters: ${error.message}`);
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

  for (const stage of Object.keys(parsedData)) {
    const playersStats = parsedData[stage];
    const statsPayloadsBatch: any[] = [];
    const seenInStage = new Set<string>();
    
    for (const row of playersStats) {
      const normalizedTeamTr = normalizeName(row.team_name);
      const teamId = teamOverrides[normalizedTeamTr] || teamMap.get(normalizedTeamTr);
      
      if (!teamId) continue;

      let player = playerMapByName.get(`${teamId}_${normalizeName(row.player_name)}`);
      if (!player) {
        player = playerMapByName.get(`${teamId}_${normalizeName(row.player_short)}`);
      }
      if (!player) {
        player = playerMapByNumber.get(`${teamId}_${row.jersey_number}`);
      }

      if (!player) {
        totalFailed++;
        continue;
      }

      const uniqueKey = `${player.id}_${stage}`;
      if (seenInStage.has(uniqueKey)) continue;
      seenInStage.add(uniqueKey);

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
        penalty_saved: row.penalties_saved || 0,
        own_goals: row.own_goals || 0,
        yellow_cards: row.yellow_cards || 0,
        red_cards: row.red_cards || 0
      };

      const points = calculatePlayerPoints(statsPayload, player.player_position);
      statsPayload.points = points;

      statsPayloadsBatch.push(statsPayload);
    }

    if (statsPayloadsBatch.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < statsPayloadsBatch.length; i += chunkSize) {
        const chunk = statsPayloadsBatch.slice(i, i + chunkSize);
        const { error: upsertErr } = await supabaseAdmin
          .from("player_stage_stats")
          .upsert(chunk, { onConflict: "player_id,stage" });

        if (upsertErr) {
          console.error(`Error bulk upserting stats chunk starting at index ${i}:`, upsertErr);
          totalFailed += chunk.length;
        } else {
          totalUpdated += chunk.length;
        }
      }
    }
  }

  return { totalUpdated, totalFailed };
}
