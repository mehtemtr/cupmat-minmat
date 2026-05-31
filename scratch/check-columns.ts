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

  console.log("Checking team_rosters columns...");
  // Query total count
  const { count: totalCount, error: countErr } = await supabaseAdmin
    .from("team_rosters")
    .select("*", { count: "exact", head: true });

  // Query count of non-null height
  const { count: nonNullCount, error: nonNullErr } = await supabaseAdmin
    .from("team_rosters")
    .select("*", { count: "exact", head: true })
    .not("height", "is", null);

  // Query sample of non-null players
  const { data: sampleData, error: sampleErr } = await supabaseAdmin
    .from("team_rosters")
    .select("team_id, player_name, height, weight, league")
    .not("height", "is", null)
    .limit(5);

  if (countErr || nonNullErr || sampleErr) {
    console.error("Query failed:", { countErr, nonNullErr, sampleErr });
  } else {
    console.log("Database Stats:");
    console.log(`- Total players in team_rosters: ${totalCount}`);
    console.log(`- Players with non-null height: ${nonNullCount}`);
    console.log("Sample non-null players:", sampleData);
  }
}

main().catch(console.error);
