import fs from "fs";
import path from "path";

const jsonPath = path.join(process.cwd(), "scratch/parsed_excel_stats.json");
const parsedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

console.log("=== FERDI KADIOGLU STATS IN PARSED JSON ===");
for (const stage of Object.keys(parsedData)) {
  const rows = parsedData[stage];
  const ferdiRows = rows.filter((r: any) => r.player_name.includes("Ferdi") || r.player_short?.includes("Ferdi"));
  if (ferdiRows.length > 0) {
    console.log(`Stage: ${stage}`);
    console.log(ferdiRows);
  }
}

console.log("\n=== LIONEL MESSI STATS IN PARSED JSON ===");
for (const stage of Object.keys(parsedData)) {
  const rows = parsedData[stage];
  const messiRows = rows.filter((r: any) => r.player_name.includes("Messi") || r.player_short?.includes("Messi"));
  if (messiRows.length > 0) {
    console.log(`Stage: ${stage}`);
    console.log(messiRows);
  }
}
