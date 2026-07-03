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
  
  const m19 = apiMatches.find((m: any) => m.id === 537419);
  console.log(JSON.stringify(m19, null, 2));
}

main();
