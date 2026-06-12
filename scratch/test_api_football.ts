import * as fs from "fs";
import * as path from "path";

// Simple custom env file parser to avoid 'dotenv' package dependency
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    const key = parts[0]?.trim();
    let val = parts.slice(1).join("=").trim();
    if (key) {
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      process.env[key] = val;
    }
  });
}

loadEnvFile(path.join(__dirname, "../.env.local"));
loadEnvFile(path.join(__dirname, "../.env"));

import { syncApiFootballScores } from "../lib/api-football";

async function main() {
  console.log("=========================================");
  console.log("   API-FOOTBALL LOCAL INTEGRATION TEST   ");
  console.log("=========================================");

  const keys = process.env.API_FOOTBALL_KEY || "";
  if (!keys) {
    console.error("ERROR: API_FOOTBALL_KEY is not defined in .env.local.");
    process.exit(1);
  }

  console.log(`Loaded API Keys: ${keys.split(",").length} keys defined.`);
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  try {
    const logs = await syncApiFootballScores("matchday_1");
    console.log("\n--- SYNCHRONIZATION LOGS ---");
    logs.forEach((log) => console.log(log));
    console.log("----------------------------");
    console.log("\nTEST COMPLETED SUCCESSFULLY!");
  } catch (err: any) {
    console.error("\nTEST FAILED:");
    console.error(err.message || err);
  }
}

main();
