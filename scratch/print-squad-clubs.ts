import * as fs from "fs";
import * as path from "path";

async function main() {
  const filePath = path.join(__dirname, "real-squads.json");
  if (!fs.existsSync(filePath)) {
    console.error("real-squads.json does not exist.");
    return;
  }

  const realSquads = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const targetTeams = ["ger", "fra", "esp", "bra", "arg"];

  for (const teamId of targetTeams) {
    const players = realSquads[teamId] || [];
    console.log(`\n=== Team: ${teamId.toUpperCase()} (${players.length} players) ===`);
    for (const player of players) {
      console.log(`- ${player.name} (${player.position}) -> ${player.club}`);
    }
  }
}

main().catch(console.error);
