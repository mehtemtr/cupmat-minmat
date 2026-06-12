import * as fs from "fs";
import * as path from "path";

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

// Map local team ID to API TLA if they differ
const TEAM_TLA_MAP: Record<string, string> = {
  hti: "hai",
  uru: "ury",
};

function normalizeLocalTla(tla: string): string {
  const t = tla.toLowerCase().trim();
  return TEAM_TLA_MAP[t] || t;
}

async function main() {
  const token = process.env.FOOTBALL_DATA_TOKEN || "";
  const url = "https://api.football-data.org/v4/competitions/WC/matches";
  const res = await fetch(url, { headers: { "X-Auth-Token": token } });
  const data = await res.json();
  const apiMatches = data.matches || [];
  const freshFixtures = generateGroupFixtures();

  const unmappedLocal = freshFixtures.filter((lf) => {
    const matched = apiMatches.some((am: any) => {
      const homeTla = (am.homeTeam.tla || "").toLowerCase().trim();
      const awayTla = (am.awayTeam.tla || "").toLowerCase().trim();
      
      const localHome = normalizeLocalTla(lf.homeTeamId);
      const localAway = normalizeLocalTla(lf.awayTeamId);

      return localHome === homeTla && localAway === awayTla;
    });
    return !matched;
  });

  console.log(`Unmapped Local Fixtures with normalization (${unmappedLocal.length}):`);
  unmappedLocal.forEach((lf) => {
    console.log(`- ${lf.id}: ${lf.homeTeamId} vs ${lf.awayTeamId} (${lf.group})`);
  });
}

main();
