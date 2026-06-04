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

  console.log("Listing tables from Supabase schema 'public'...");
  const { data, error } = await supabaseAdmin.rpc("get_tables"); // Try if get_tables RPC exists

  if (error) {
    // Fallback: Query pg_tables via raw sql if RPC is not present
    const { data: tables, error: sqlError } = await supabaseAdmin
      .from("pg_tables")
      .select("tablename")
      .eq("schemaname", "public");

    if (sqlError) {
      console.log("Failed to load tables directly. Let's try executing a raw query or checking metadata.");
      // Let's run a query on pg_class or check a known table to see if it responds
      const knownTables = ["team_rosters", "match_analyses", "match_weather", "player_status", "ai_agent_logs", "fantasy_rosters", "fantasy_duels", "fantasy_duel_standings"];
      for (const table of knownTables) {
        const { count, error: tErr } = await supabaseAdmin.from(table).select("*", { count: "exact", head: true });
        if (tErr) {
          console.log(`- ${table}: Error (${tErr.message})`);
        } else {
          console.log(`- ${table}: Active (${count} rows)`);
        }
      }
    } else {
      console.log("Tables in public schema:");
      tables?.forEach(t => console.log(`- ${t.tablename}`));
    }
  } else {
    console.log("Tables list:", data);
  }
}

main().catch(console.error);
