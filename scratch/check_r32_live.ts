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

async function main() {
  const token = process.env.FOOTBALL_DATA_TOKEN || "";
  if (!token) {
    console.error("ERROR: FOOTBALL_DATA_TOKEN is not defined.");
    process.exit(1);
  }

  const url = "https://api.football-data.org/v4/competitions/WC/matches";
  const res = await fetch(url, {
    headers: { "X-Auth-Token": token }
  });

  if (!res.ok) {
    console.error(`API error! status: ${res.status}`);
    return;
  }

  const data = await res.json();
  const apiMatches = data.matches || [];
  
  console.log(`Total matches in Football-Data: ${apiMatches.length}`);
  
  // Find any match involving Germany (ger) or Sweden (swe)
  const matches = apiMatches.filter((m: any) => {
    const home = (m.homeTeam.tla || "").toLowerCase().trim();
    const away = (m.awayTeam.tla || "").toLowerCase().trim();
    return home === "ger" || away === "ger" || home === "swe" || away === "swe";
  });

  console.log("Found matches involving GER or SWE:", matches.length);
  matches.forEach((m: any) => {
    const home = (m.homeTeam.tla || "").toLowerCase().trim();
    const away = (m.awayTeam.tla || "").toLowerCase().trim();
    console.log(`Match ${m.id || ""}: ${m.homeTeam.name} (${home}) vs ${m.awayTeam.name} (${away})`);
    console.log(`  Stage: ${m.stage}, Status: ${m.status}, Score: ${m.score.fullTime.home} - ${m.score.fullTime.away}`);
  });
}

main();
