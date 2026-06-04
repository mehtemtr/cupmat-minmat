import { supabaseAdmin } from "../lib/supabase";
import { TEAMS } from "../data/teams";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const dir = path.join(__dirname, "..");
  const envFiles = [".env", ".env.local"];
  let envJwt: string | undefined;

  const envPathDefault = path.join(dir, ".env");
  if (fs.existsSync(envPathDefault)) {
    const lines = fs.readFileSync(envPathDefault, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[1] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
        if (val.trim().includes(".")) {
          envJwt = val.trim();
        }
      }
    }
  }

  for (const file of envFiles) {
    const envPath = path.join(dir, file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        if (line.trim().startsWith("#")) continue;
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      }
    }
  }

  if (envJwt && (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("."))) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = envJwt;
  }
}

function mapPositionToAbbreviation(pos: string): string {
  const p = pos.toUpperCase();
  if (p.includes("GK") || p.includes("KALECI")) return "GK";
  if (p.includes("DF") || p.includes("DEFANS") || p.includes("STOPER") || p.includes("BEK")) return "DF";
  if (p.includes("MF") || p.includes("SAHA") || p.includes("LİBERO") || p.includes("LIBERO") || p.includes("MIDFIELDER")) return "MF";
  if (p.includes("FW") || p.includes("FORVET") || p.includes("AÇIK") || p.includes("ACIK")) return "FW";
  return pos;
}

async function main() {
  loadEnv();
  const { supabaseAdmin } = await import("../lib/supabase");

  console.log("Fetching all players from team_rosters...");
  const players: any[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from("team_rosters")
      .select("team_id, player_name, player_position, player_number, is_captain, club, date_of_birth")
      .range(from, to);

    if (error) {
      console.error("Error fetching players from Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
      players.push(...data);
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

  console.log(`Fetched ${players.length} players from database.`);

  // Group players by team_id
  const teamPlayersMap: Record<string, any[]> = {};
  players.forEach(p => {
    if (!teamPlayersMap[p.team_id]) {
      teamPlayersMap[p.team_id] = [];
    }

    const birthYear = p.date_of_birth ? new Date(p.date_of_birth).getFullYear() : 2000;
    const age = 2026 - birthYear;

    teamPlayersMap[p.team_id].push({
      name: p.player_name,
      position: mapPositionToAbbreviation(p.player_position),
      club: p.club || "Serbest",
      age: age
    });
  });

  // Reconstruct seeds based on memory TEAMS
  const updatedSeeds = TEAMS.map(team => {
    // get players for this team, sorted by number or original order
    const dbPlayers = teamPlayersMap[team.id] || [];
    
    // Sort players so captains/stars/GK are aligned nicely or keep as inserted
    // Let's keep the order returned from the database or the original squad order if available.
    // If no players in DB, fallback to team's existing players
    const finalPlayers = dbPlayers.length > 0 ? dbPlayers : team.players.map(p => ({
      name: p.name,
      position: p.position,
      club: p.club,
      age: p.age
    }));

    return {
      id: team.id,
      code: team.code,
      nameEn: team.nameEn,
      nameTr: team.nameTr,
      fifaRank: team.fifaRank,
      group: team.group,
      confederation: team.confederation,
      manager: {
        name: team.manager.name,
        nationality: team.manager.nationality,
        age: team.manager.age,
        tenure: team.manager.tenure
      },
      players: finalPlayers
    };
  });

  console.log(`Prepared updated seeds for 48 teams. Generating teams.ts...`);

  const fileContent = `import type { GroupId, Team } from "@/lib/types/tournament";
import { Locale } from "@/lib/i18n/types";
import { getDrawOrder } from "@/data/official-groups";
import { validateTeamsData } from "@/data/validate-teams";

function flag(code: string) {
  return \`https://flagcdn.com/w80/\${code.toLowerCase()}.png\`;
}

function squad(
  teamId: string,
  players: { name: string; position: string; club: string; age: number }[],
) {
  return players.map((p, i) => ({
    id: \`\${teamId}-p\${i + 1}\`,
    ...p,
  }));
}

type TeamSeed = {
  id: string;
  code: string;
  nameEn: string;
  nameTr: string;
  fifaRank: number;
  group: GroupId;
  confederation: string;
  manager: { name: string; nationality: string; age: number; tenure: string };
  players: { name: string; position: string; club: string; age: number }[];
};

/** Official FIFA World Cup 2026 group draw — 48 nations, groups A–L */
const seeds: TeamSeed[] = ${JSON.stringify(updatedSeeds, null, 2)};

export function sortPlayersWithBjkBias(players: any[]): any[] {
  const isBjk = (club: string) => {
    if (!club) return false;
    const c = club.toLowerCase();
    return c.includes("beşiktaş") || c.includes("besiktas") || c === "bjk";
  };
  
  const isGs = (club: string) => {
    if (!club) return false;
    const c = club.toLowerCase();
    return c.includes("galatasaray") || c === "gs" || c.includes("g.saray");
  };

  const positionsOrder = ["GK", "DF", "MF", "FW"];
  const result: any[] = [];

  for (const pos of positionsOrder) {
    const posPlayers = players.filter(p => p.position === pos);
    const bjkPlayers = posPlayers.filter(p => isBjk(p.club));
    const gsPlayers = posPlayers.filter(p => isGs(p.club));
    const otherPlayers = posPlayers.filter(p => !isBjk(p.club) && !isGs(p.club));
    
    result.push(...bjkPlayers, ...otherPlayers, ...gsPlayers);
  }

  const leftoverPlayers = players.filter(p => !positionsOrder.includes(p.position));
  if (leftoverPlayers.length > 0) {
    const bjkPlayers = leftoverPlayers.filter(p => isBjk(p.club));
    const gsPlayers = leftoverPlayers.filter(p => isGs(p.club));
    const otherPlayers = leftoverPlayers.filter(p => !isBjk(p.club) && !isGs(p.club));
    result.push(...bjkPlayers, ...otherPlayers, ...gsPlayers);
  }

  return result;
}

export const TEAMS: Team[] = seeds.map((s) => ({
  id: s.id,
  code: s.code,
  nameEn: s.nameEn,
  nameTr: s.nameTr,
  fifaRank: s.fifaRank,
  group: s.group,
  drawOrder: getDrawOrder(s.id),
  confederation: s.confederation,
  flagUrl: flag(s.code),
  manager: s.manager,
  players: sortPlayersWithBjkBias(squad(s.id, s.players)),
}));

validateTeamsData(TEAMS);

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamsByGroup(group: GroupId): Team[] {
  return TEAMS.filter((t) => t.group === group).sort(
    (a, b) => a.drawOrder - b.drawOrder,
  );
}

export function getTeamName(team: Team, locale: Locale): string {
  if (locale === "tr") return team.nameTr;
  return team.nameEn;
}

export function getAllPlayers() {
  return TEAMS.flatMap((team) =>
    team.players.map((player) => ({
      ...player,
      teamId: team.id,
      teamNameEn: team.nameEn,
      teamNameTr: team.nameTr,
      teamFlagUrl: team.flagUrl,
    }))
  );
}

/** Bump when official draw changes — clears stale browser tournament cache */
export const TOURNAMENT_DATA_VERSION = "wc2026-official-draw-v2";
`;

  const outputPath = path.join(__dirname, "..", "data", "teams.ts");
  fs.writeFileSync(outputPath, fileContent, "utf8");
  console.log(`Successfully wrote updated teams.ts to ${outputPath}`);
}

main().catch(console.error);
