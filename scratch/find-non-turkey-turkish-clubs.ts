import * as fs from "fs";
import * as path from "path";

async function main() {
  const filePath = path.join(__dirname, "real-squads.json");
  if (!fs.existsSync(filePath)) {
    console.error("real-squads.json does not exist.");
    return;
  }

  const realSquads = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const turkishClubs = ["galatasaray", "fenerbahce", "besiktas", "trabzonspor", "basaksehir", "genclerbirligi", "rize", "kasimpasa", "goztepe", "antalyaspor", "konyaspor", "samsunspor", "bodrum", "sivasspor", "alanyaspor", "adana", "gaziantep", "hatayspor", "kayserispor"];

  const normalize = (str: string) => {
    return str.toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o");
  };

  console.log("Checking non-Turkish national team players with Turkish clubs (normalized):");
  
  for (const [teamId, players] of Object.entries(realSquads)) {
    if (teamId === "tur") continue; // Skip Turkey itself
    
    for (const player of (players as any[])) {
      const clubNorm = normalize(player.club || "");
      const hasTurkishClub = turkishClubs.some(tc => clubNorm.includes(tc));
      
      if (hasTurkishClub) {
        console.log(`- Team: ${teamId}, Player: ${player.name}, Club: ${player.club}`);
      }
    }
  }

}

main().catch(console.error);
