import { supabaseAdmin } from "../lib/supabase";
import { TEAMS } from "../data/teams";
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

  console.log("Fetching all players from team_rosters...");
  const { data: players, error } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .order("team_id", { ascending: true })
    .order("player_number", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
    return;
  }

  console.log(`Fetched ${players?.length || 0} players. Mapping teams...`);

  // Build a lookup map for teams
  const teamMap = new Map<string, { nameTr: string; nameEn: string; confederation: string }>();
  TEAMS.forEach(t => {
    teamMap.set(t.id, {
      nameTr: t.nameTr,
      nameEn: t.nameEn,
      confederation: t.confederation
    });
  });

  const csvRows = [];
  // CSV Header
  csvRows.push("Player ID,Team Code,Team Name (TR),Team Name (EN),Confederation,Player Name,Position,Number,Is Captain,Club,Created At");

  players?.forEach(p => {
    const teamInfo = teamMap.get(p.team_id) || { nameTr: p.team_id, nameEn: p.team_id, confederation: "Unknown" };
    
    // Helper to escape values for CSV
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    csvRows.push([
      escapeCsv(p.id),
      escapeCsv(p.team_id),
      escapeCsv(teamInfo.nameTr),
      escapeCsv(teamInfo.nameEn),
      escapeCsv(teamInfo.confederation),
      escapeCsv(p.player_name),
      escapeCsv(p.player_position),
      escapeCsv(p.player_number),
      escapeCsv(p.is_captain),
      escapeCsv(p.club),
      escapeCsv(p.created_at)
    ].join(","));
  });

  const artifactsDir = "C:/Users/pc/.gemini/antigravity/brain/32512816-fff8-42c7-a7ef-22d4f87b2bd4";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const csvPath = path.join(artifactsDir, "current_players_list.csv");
  fs.writeFileSync(csvPath, csvRows.join("\n"), "utf8");

  console.log(`✅ CSV successfully exported to: ${csvPath}`);
}

main().catch(console.error);
