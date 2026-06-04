import { supabaseAdmin } from "../lib/supabase";
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
      .select("team_id, player_name, player_position, club")
      .range(from, to);

    if (error) {
      console.error("Error fetching players:", error);
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

  console.log(`Loaded ${players.length} players from database.`);

  const mockTeams: Record<string, string[]> = {};
  const realTeams: Record<string, string[]> = {};

  players.forEach(p => {
    const isMock = p.player_name.includes("Oyuncu") || p.player_name.includes("Player");
    const list = isMock ? mockTeams : realTeams;
    if (!list[p.team_id]) list[p.team_id] = [];
    list[p.team_id].push(p.player_name);
  });

  console.log("\n=== Mock Teams (Teams with generic names like 'Cezayir Oyuncu 1'): ===");
  Object.keys(mockTeams).forEach(tid => {
    console.log(`- ${tid}: ${mockTeams[tid].length} mock players (Sample: ${mockTeams[tid][0]})`);
  });

  console.log("\n=== Real Teams (Teams with actual player names): ===");
  Object.keys(realTeams).forEach(tid => {
    console.log(`- ${tid}: ${realTeams[tid].length} real players (Sample: ${realTeams[tid][0]}, ${realTeams[tid][1] || ""})`);
  });
}

main().catch(console.error);
