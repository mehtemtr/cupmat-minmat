import * as fs from "fs";
import * as path from "path";
import { TEAMS } from "../data/teams";

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
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[\s\-\.]/g, ""); // remove spaces, dashes, periods
}

async function main() {
  const wikiPath = path.join(__dirname, "real-squads.json");
  if (!fs.existsSync(wikiPath)) {
    console.error("Wiki squads file not found:", wikiPath);
    return;
  }

  const wikiData = JSON.parse(fs.readFileSync(wikiPath, "utf8"));
  console.log(`Loaded Wikipedia squads for ${Object.keys(wikiData).length} teams.`);
  console.log(`Loaded ${TEAMS.length} teams from local teams.ts.`);

  let totalWikiPlayers = 0;
  let totalLocalPlayers = 0;
  let totalExactMatches = 0;
  let totalNormalizedMatches = 0;
  let totalWikiOnly = 0;
  let totalLocalOnly = 0;

  const mismatchesReport: any[] = [];

  TEAMS.forEach(localTeam => {
    const tid = localTeam.id.toLowerCase();
    // In wikiData, keys are team ids (e.g., 'tur', 'mex', etc.)
    const wikiPlayers = wikiData[tid] || [];
    const localPlayers = localTeam.players || [];

    totalWikiPlayers += wikiPlayers.length;
    totalLocalPlayers += localPlayers.length;

    const wikiNormalized = wikiPlayers.map((p: any) => ({ original: p.name, normalized: normalizeName(p.name), p }));
    const localNormalized = localPlayers.map((p: any) => ({ original: p.name, normalized: normalizeName(p.name), p }));

    const localUsed = new Set<string>();
    const wikiUsed = new Set<string>();

    // 1. Exact matches
    localNormalized.forEach(l => {
      const idx = wikiNormalized.findIndex(w => w.original === l.original && !wikiUsed.has(w.original));
      if (idx !== -1) {
        totalExactMatches++;
        localUsed.add(l.original);
        wikiUsed.add(wikiNormalized[idx].original);
      }
    });

    // 2. Normalized matches (different spelling/accents/Turkish characters)
    localNormalized.forEach(l => {
      if (localUsed.has(l.original)) return;

      const idx = wikiNormalized.findIndex(w => w.normalized === l.normalized && !wikiUsed.has(w.original));
      if (idx !== -1) {
        totalNormalizedMatches++;
        localUsed.add(l.original);
        wikiUsed.add(wikiNormalized[idx].original);
        mismatchesReport.push({
          team: localTeam.nameTr,
          type: "Spelling / Accent Difference",
          localName: l.original,
          wikiName: wikiNormalized[idx].original
        });
      }
    });

    // 3. Leftovers
    const localOnly = localNormalized.filter(l => !localUsed.has(l.original)).map(l => l.original);
    const wikiOnly = wikiNormalized.filter(w => !wikiUsed.has(w.original)).map(w => w.original);

    totalLocalOnly += localOnly.length;
    totalWikiOnly += wikiOnly.length;

    if (localOnly.length > 0 || wikiOnly.length > 0) {
      mismatchesReport.push({
        team: localTeam.nameTr,
        type: "Different Players",
        localOnly: localOnly.slice(0, 5).join(", ") + (localOnly.length > 5 ? "..." : ""),
        wikiOnly: wikiOnly.slice(0, 5).join(", ") + (wikiOnly.length > 5 ? "..." : "")
      });
    }
  });

  console.log("\n=== COMPARISON RESULTS (WIKIPEDIA VS LOCAL TEAMS) ===");
  console.log(`Total Wiki Players: ${totalWikiPlayers}`);
  console.log(`Total Local Players: ${totalLocalPlayers}`);
  console.log(`Exact Matches: ${totalExactMatches}`);
  console.log(`Normalized Matches (spelling/Turkish character differences): ${totalNormalizedMatches}`);
  console.log(`Local only players: ${totalLocalOnly}`);
  console.log(`Wiki only players: ${totalWikiOnly}`);

  console.log("\n=== SAMPLE MISMATCHES / SPELLING DIFFERENCES (FIRST 30): ===");
  console.table(mismatchesReport.slice(0, 30));
}

main().catch(console.error);
