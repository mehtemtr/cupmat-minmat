import * as fs from "fs";
import * as path from "path";

// Simple env file parser
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

import { generateGroupFixtures } from "../lib/fixtures";

async function main() {
  console.log("=========================================");
  console.log("  FOOTBALL-DATA.ORG INTEGRATION TEST     ");
  console.log("=========================================");

  const token = process.env.FOOTBALL_DATA_TOKEN || "";
  if (!token) {
    console.error("ERROR: FOOTBALL_DATA_TOKEN is not defined in .env.local.");
    process.exit(1);
  }

  console.log(`Loaded API Token: ${token}`);

  try {
    const url = "https://api.football-data.org/v4/competitions/WC/matches";
    const res = await fetch(url, {
      headers: { "X-Auth-Token": token }
    });

    if (!res.ok) {
      throw new Error(`API error! status: ${res.status}`);
    }

    const data = await res.json();
    const apiMatches = data.matches || [];
    const freshFixtures = generateGroupFixtures();

    console.log(`\nFound ${apiMatches.length} World Cup matches in Football-Data.org API.`);

    const mapped = apiMatches.map((m: any) => {
      const homeTla = (m.homeTeam.tla || "").toLowerCase().trim();
      const awayTla = (m.awayTeam.tla || "").toLowerCase().trim();

      const localMatch = freshFixtures.find(
        (f) => f.homeTeamId === homeTla && f.awayTeamId === awayTla
      );

      if (!localMatch) return null;

      return {
        id: localMatch.id,
        teams: `${homeTla} vs ${awayTla}`,
        score: `${m.score.fullTime.home} - ${m.score.fullTime.away}`,
        status: m.status,
        played: m.status === "FINISHED"
      };
    }).filter(Boolean);

    console.log(`\nSuccessfully mapped matches: ${mapped.length}`);
    console.log("\n--- MAPPED MATCH DETAILS ---");
    mapped.slice(0, 10).forEach((m: any) => {
      console.log(`Match ${m.id} (${m.teams}) | Score: ${m.score} | Status: ${m.status} | Played: ${m.played}`);
    });
    if (mapped.length > 10) {
      console.log(`... and ${mapped.length - 10} more matches.`);
    }
    console.log("----------------------------");
    console.log("\nTEST COMPLETED SUCCESSFULLY!");
  } catch (err: any) {
    console.error("\nTEST FAILED:");
    console.error(err.message || err);
  }
}

main();
