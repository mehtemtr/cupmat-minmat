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

const corrections: Record<string, string> = {
  // Turkey (User-confirmed transfers)
  "Uğurcan Çakır": "Galatasaray",
  "Mert Günok": "Fenerbahçe",
  "Eren Elmalı": "Trabzonspor",
  "Samet Akaydin": "Çaykur Rizespor",
  "Yusuf Akçiçek": "Fenerbahçe",
  "Mustafa Eskihellaç": "Gaziantep FK",
  "Ahmetcan Kaplan": "Ajax",
  "Kerem Aktürkoğlu": "Fenerbahçe",
  "İrfan Can Kahveci": "Kasımpaşa",
  "Orkun Kökçü": "Beşiktaş",
  "Demir Ege Tıknaz": "Braga",

  // Portugal
  "Ricardo Velho": "Farense",
  "Rui Silva": "Real Betis",
  "Nélson Semedo": "Wolverhampton Wanderers",

  // France
  "Théo Hernandez": "AC Milan",
  "Rayan Cherki": "Lyon",
  "Brice Samba": "Lens",
  "Robin Risser": "Strasbourg",
  "N'Golo Kanté": "Al-Ittihad",

  // Germany (User-confirmed transfer)
  "Florian Wirtz": "Bayer Leverkusen",
  "Leroy Sané": "Galatasaray",
  "Pascal Groß": "Borussia Dortmund",
  "Nick Woltemade": "VfB Stuttgart",

  // Spain
  "Joan Garcia": "Espanyol",
  "Aymeric Laporte": "Al-Nassr",
  "Marc Pubill": "Almería",
  "Martín Zubimendi": "Real Sociedad",
  "Álex Baena": "Villarreal",
  "Yéremy Pino": "Villarreal",

  // Brazil (User-confirmed transfer)
  "Weverton": "Palmeiras",
  "Ederson": "Fenerbahçe",
  "Wesley": "Al-Nassr",
  "Danilo Luiz": "Juventus",
  "Matheus Cunha": "Wolverhampton Wanderers",
  "Endrick": "Real Madrid",
  "Luiz Henrique": "Botafogo",

  // Argentina
  "Rodrigo De Paul": "Atlético Madrid",
  "Nicolás González": "Juventus",
  "Thiago Almada": "Botafogo",
  "Nico Paz": "Como",

  // Other vandalized non-Turkey players
  "Edson Álvarez": "West Ham United",
  "Oh Hyeon-gyu": "Beşiktaş",
  "Nihad Mujakić": "Partizan",
  "Frantzdy Pierrot": "AEK Athens",
  "Yahia Fofana": "Angers",
  "Wilfried Singo": "Monaco",
  "Emmanuel Agbadou": "Beşiktaş",
  "Christopher Opéri": "Le Havre",
  "Christ Inao Oulaï": "Serbest",
  "Joshua Brenet": "Serbest",
  "Noa Lang": "PSV Eindhoven",
  "Adem Arous": "ES Tunis",
  "Wagner Pina": "Estoril",
  "Nuno da Costa": "Kasımpaşa",
  "Cherif Ndiaye": "Red Star Belgrade",
  "Eldor Shomurodov": "Roma",
  "Abbosbek Fayzullaev": "CSKA Moscow",
  "Meschak Elia": "Young Boys",
  "Amir Murillo": "Beşiktaş",

  // England
  "Jarell Quansah": "Liverpool",
  "Jordan Henderson": "Ajax",
  "Marcus Rashford": "Manchester United",
  "Noni Madueke": "Chelsea"
};

async function main() {
  loadEnv();
  const jsonPath = path.join(__dirname, "real-squads.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("real-squads.json does not exist.");
    return;
  }

  console.log("Loading real-squads.json...");
  const realSquads = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  
  // Remove Ersin Destanoğlu from Turkey squad if present
  if (realSquads.tur) {
    const originalLength = realSquads.tur.length;
    realSquads.tur = realSquads.tur.filter((p: any) => p.name !== "Ersin Destanoğlu");
    const removedCount = originalLength - realSquads.tur.length;
    if (removedCount > 0) {
      console.log(`- Removed Ersin Destanoğlu from Turkey squad (previous count: ${originalLength}, new count: ${realSquads.tur.length}).`);
    }
  }

  let correctedCount = 0;
  for (const [teamId, players] of Object.entries(realSquads)) {
    for (const player of (players as any[])) {
      if (corrections[player.name]) {
        const oldClub = player.club;
        const newClub = corrections[player.name];
        if (oldClub !== newClub) {
          player.club = newClub;
          correctedCount++;
          console.log(`- Corrected [${teamId.toUpperCase()}] ${player.name}: ${oldClub} -> ${newClub}`);
        }
      }
    }
  }

  console.log(`Saving updated real-squads.json...`);
  fs.writeFileSync(jsonPath, JSON.stringify(realSquads, null, 2), "utf8");


  // Repopulate rosters
  console.log("\nDeleting all records from team_rosters database table...");
  const { supabaseAdmin } = await import("../lib/supabase");
  const { error: deleteError } = await supabaseAdmin
    .from("team_rosters")
    .delete()
    .neq("team_id", "EXCLUDED_PLACEHOLDER");

  if (deleteError) {
    console.error("Failed to clear team_rosters database:", deleteError);
    return;
  }
  console.log("Database cleared successfully.");

  console.log("Triggering updateTeamRosters(force=true) to repopulate database with correct clubs...");
  const { updateTeamRosters } = await import("../lib/ai-sports-agent");
  const rosterResult = await updateTeamRosters(true);
  console.log("Database repopulation result:", rosterResult);

  console.log("\nRunning sync-teams-data.ts to sync database data with data/teams.ts...");
  // We can require/execute main() of sync-teams-data directly
  const syncModule = await import("./sync-teams-data");
  // The module imports execute main automatically.
  
  console.log("\nRunning fix-player-leagues.ts to update leagues in the database...");
  const fixLeaguesModule = await import("./fix-player-leagues");

  console.log("\nFinished successfully!");
}

main().catch(console.error);
