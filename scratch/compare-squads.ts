import { supabaseAdmin } from "../lib/supabase";
import { TEAMS } from "../data/teams";
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

// Helper to normalize characters
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/ñ/g, "n")
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u")
    .replace(/[\s\-\.]/g, ""); // remove spaces, dashes, periods
}

async function main() {
  loadEnv();
  const { supabaseAdmin } = await import("../lib/supabase");

  console.log("Fetching all players from team_rosters database table...");
  const dbPlayers: any[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from("team_rosters")
      .select("team_id, player_name, player_position, club")
      .range(from, to);

    if (error) {
      console.error("Error fetching players from Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
      dbPlayers.push(...data);
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

  console.log(`Fetched ${dbPlayers.length} players from database.`);
  console.log(`Loaded ${TEAMS.length} teams from local teams.ts.`);

  // Group database players by team_id
  const dbTeamMap: Record<string, any[]> = {};
  dbPlayers.forEach(p => {
    const tid = p.team_id.toLowerCase();
    if (!dbTeamMap[tid]) dbTeamMap[tid] = [];
    dbTeamMap[tid].push(p);
  });

  let totalExactMatches = 0;
  let totalNormalizedMatches = 0;
  let totalDbOnly = 0;
  let totalLocalOnly = 0;

  const mismatchesReport: any[] = [];

  TEAMS.forEach(localTeam => {
    const tid = localTeam.id.toLowerCase();
    const dbTeamPlayers = dbTeamMap[tid] || [];
    const localPlayers = localTeam.players || [];

    const dbNames = dbTeamPlayers.map(p => p.player_name);
    const localNames = localPlayers.map(p => p.name);

    const dbNormalized = dbTeamPlayers.map(p => ({ original: p.player_name, normalized: normalizeName(p.player_name), p }));
    const localNormalized = localPlayers.map(p => ({ original: p.name, normalized: normalizeName(p.name), p }));

    // Find matches and mismatches
    const localUsed = new Set<string>();
    const dbUsed = new Set<string>();

    // 1. Exact matches
    localNormalized.forEach(l => {
      const idx = dbNormalized.findIndex(d => d.original === l.original && !dbUsed.has(d.original));
      if (idx !== -1) {
        totalExactMatches++;
        localUsed.add(l.original);
        dbUsed.add(dbNormalized[idx].original);
      }
    });

    // 2. Normalized matches (different spelling/accents/Turkish characters)
    localNormalized.forEach(l => {
      if (localUsed.has(l.original)) return;

      const idx = dbNormalized.findIndex(d => d.normalized === l.normalized && !dbUsed.has(d.original));
      if (idx !== -1) {
        totalNormalizedMatches++;
        localUsed.add(l.original);
        dbUsed.add(dbNormalized[idx].original);
        mismatchesReport.push({
          team: localTeam.nameTr,
          type: "Spelling / Accent Difference",
          local: l.original,
          database: dbNormalized[idx].original
        });
      }
    });

    // 3. Leftovers
    const localOnly = localNormalized.filter(l => !localUsed.has(l.original)).map(l => l.original);
    const dbOnly = dbNormalized.filter(d => !dbUsed.has(d.original)).map(d => d.original);

    totalLocalOnly += localOnly.length;
    totalDbOnly += dbOnly.length;

    if (localOnly.length > 0 || dbOnly.length > 0) {
      mismatchesReport.push({
        team: localTeam.nameTr,
        type: "Different Players",
        localOnly: localOnly.join(", "),
        dbOnly: dbOnly.join(", ")
      });
    }
  });

  console.log("\n=== COMPARISON RESULTS ===");
  console.log(`Exact Matches: ${totalExactMatches}`);
  console.log(`Normalized Matches (accents/Turkish char differences): ${totalNormalizedMatches}`);
  console.log(`Local (code) only players: ${totalLocalOnly}`);
  console.log(`Database only players: ${totalDbOnly}`);

  console.log("\n=== SPECIFIC MISMATCHES / SPELLING DIFFERENCES (FIRST 50): ===");
  console.table(mismatchesReport.slice(0, 50));

  if (mismatchesReport.length > 50) {
    console.log(`... and ${mismatchesReport.length - 50} more mismatches.`);
  }
}

main().catch(console.error);
