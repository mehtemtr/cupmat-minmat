import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

async function main() {
  const cwd = path.join(__dirname, "..");

  console.log("=== STEP 1: SCRAPING NEW SQUADS FROM WIKIPEDIA ===");
  try {
    execSync("npx tsx scratch/scrape-wikipedia-squads.ts", {
      cwd,
      stdio: "inherit"
    });
    console.log("✅ Successfully scraped squad lists from Wikipedia.");
  } catch (error) {
    console.error("❌ Failed to scrape squads from Wikipedia:", error);
    return;
  }

  console.log("\n=== STEP 2: APPLYING FANTASY TRANSFERS & CUSTOM CORRECTIONS ===");
  try {
    execSync("npx tsx scratch/fix-vandalized-clubs.ts", {
      cwd,
      stdio: "inherit"
    });
    console.log("✅ Successfully applied all corrections, updated the database, and synced teams.ts.");
  } catch (error) {
    console.error("❌ Failed to apply corrections:", error);
    return;
  }

  console.log("\n🎉 All steps completed successfully! Your squads are updated with new FIFA lists and custom transfers.");
}

main().catch(console.error);
