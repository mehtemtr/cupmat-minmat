import { supabaseAdmin } from "../lib/supabase";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const dir = path.join(__dirname, "..");
  const envFiles = [".env", ".env.local"];
  let envJwt: string | undefined;

  // First pass: find the valid JWT from .env
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

  console.log("=== CHECKING AI AGENT RUN LOGS ===");
  const { data: logs, error: lError } = await supabaseAdmin
    .from("ai_agent_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  if (lError) {
    console.error("Error loading agent logs:", lError);
  } else {
    console.log(`Loaded last ${logs?.length || 0} run logs:`);
    logs?.forEach(log => {
      console.log(`- [${log.started_at}] Agent: ${log.agent_name}, Task: ${log.task_type}, Status: ${log.status}, Items Processed: ${log.items_processed}, Error: ${log.error_message || "None"}`);
    });
  }

  console.log("\n=== CHECKING TEAM ROSTERS (PLAYERS) ===");
  const players: any[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error: pError } = await supabaseAdmin
      .from("team_rosters")
      .select("team_id, player_name, player_position, player_number, is_captain, club")
      .range(from, to);
      
    if (pError) {
      console.error("Error loading players:", pError);
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

  console.log(`Total players loaded in team_rosters: ${players.length}`);
  
  // Group by team
  const teamCounts: Record<string, number> = {};
  players.forEach(p => {
    teamCounts[p.team_id] = (teamCounts[p.team_id] || 0) + 1;
  });

  console.log("\nPlayer distribution by team_id:");
  Object.entries(teamCounts).forEach(([teamId, count]) => {
    console.log(`- ${teamId}: ${count} players`);
  });

  if (players && players.length > 0) {
    console.log("\nSample Players (First 10):");
    console.table(players.slice(0, 10));
  }
}

main().catch(console.error);
