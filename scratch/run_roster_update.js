const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load keys from .env and .env.local
const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

let supabaseKey = "";
let supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co"; // Default fallback

function parseEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
    if (keyMatch) supabaseKey = keyMatch[1].trim().replace(/['"]/g, "");
    
    const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/);
    if (urlMatch) {
      const val = urlMatch[1].trim().replace(/['"]/g, "");
      if (val && val !== "https://supabase.com") {
        supabaseUrl = val;
      }
    }
  }
}

parseEnv(envPath);
parseEnv(envLocalPath);

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY not found!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const usaPlayers = [
  { name: "Chris Brady", position: "Kaleci", number: 1, isCaptain: false, club: "Chicago Fire" },
  { name: "Matt Freese", position: "Kaleci", number: 2, isCaptain: false, club: "New York City FC" },
  { name: "Matt Turner", position: "Kaleci", number: 3, isCaptain: false, club: "Crystal Palace" },
  { name: "Max Arfsten", position: "Defans", number: 4, isCaptain: false, club: "Columbus Crew" },
  { name: "Sergino Dest", position: "Defans", number: 5, isCaptain: false, club: "PSV Eindhoven" },
  { name: "Alex Freeman", position: "Defans", number: 6, isCaptain: false, club: "Orlando City" },
  { name: "Mark McKenzie", position: "Defans", number: 7, isCaptain: false, club: "Toulouse" },
  { name: "Tim Ream", position: "Defans", number: 8, isCaptain: false, club: "Charlotte FC" },
  { name: "Chris Richards", position: "Defans", number: 9, isCaptain: false, club: "Crystal Palace" },
  { name: "Antonee Robinson", position: "Defans", number: 10, isCaptain: false, club: "Fulham" },
  { name: "Miles Robinson", position: "Defans", number: 11, isCaptain: false, club: "FC Cincinnati" },
  { name: "Joe Scally", position: "Defans", number: 12, isCaptain: false, club: "Borussia Monchengladbach" },
  { name: "Auston Trusty", position: "Defans", number: 13, isCaptain: false, club: "Celtic" },
  { name: "Tyler Adams", position: "Orta Saha", number: 14, isCaptain: false, club: "Bournemouth" },
  { name: "Sebastian Berhalter", position: "Orta Saha", number: 15, isCaptain: false, club: "Vancouver Whitecaps" },
  { name: "Weston McKennie", position: "Orta Saha", number: 16, isCaptain: false, club: "Juventus" },
  { name: "Gio Reyna", position: "Orta Saha", number: 17, isCaptain: false, club: "Borussia Dortmund" },
  { name: "Cristian Roldan", position: "Orta Saha", number: 18, isCaptain: false, club: "Seattle Sounders" },
  { name: "Malik Tillman", position: "Orta Saha", number: 19, isCaptain: false, club: "PSV Eindhoven" },
  { name: "Brenden Aaronson", position: "Forvet", number: 20, isCaptain: false, club: "Leeds United" },
  { name: "Folarin Balogun", position: "Forvet", number: 21, isCaptain: false, club: "Monaco" },
  { name: "Ricardo Pepi", position: "Forvet", number: 22, isCaptain: false, club: "PSV Eindhoven" },
  { name: "Christian Pulisic", position: "Forvet", number: 23, isCaptain: true, club: "AC Milan" },
  { name: "Tim Weah", position: "Forvet", number: 24, isCaptain: false, club: "Juventus" },
  { name: "Haji Wright", position: "Forvet", number: 25, isCaptain: false, club: "Coventry City" },
  { name: "Alejandro Zendejas", position: "Forvet", number: 26, isCaptain: false, club: "Club America" },
];

const nedPlayers = [
  { name: "Bart Verbruggen", position: "Kaleci", number: 1, isCaptain: false, club: "Brighton" },
  { name: "Mark Flekken", position: "Kaleci", number: 2, isCaptain: false, club: "Brentford" },
  { name: "Robin Roefs", position: "Kaleci", number: 3, isCaptain: false, club: "NEC Nijmegen" },
  { name: "Nathan Ake", position: "Defans", number: 4, isCaptain: false, club: "Manchester City" },
  { name: "Denzel Dumfries", position: "Defans", number: 5, isCaptain: false, club: "Inter Milan" },
  { name: "Jorrel Hato", position: "Defans", number: 6, isCaptain: false, club: "Ajax" },
  { name: "Jurrien Timber", position: "Defans", number: 7, isCaptain: false, club: "Arsenal" },
  { name: "Micky van de Ven", position: "Defans", number: 8, isCaptain: false, club: "Tottenham Hotspur" },
  { name: "Virgil van Dijk", position: "Defans", number: 9, isCaptain: true, club: "Liverpool" },
  { name: "Jan Paul van Hecke", position: "Defans", number: 10, isCaptain: false, club: "Brighton" },
  { name: "Frenkie de Jong", position: "Orta Saha", number: 11, isCaptain: false, club: "Barcelona" },
  { name: "Marten de Roon", position: "Orta Saha", number: 12, isCaptain: false, club: "Atalanta" },
  { name: "Ryan Gravenberch", position: "Orta Saha", number: 13, isCaptain: false, club: "Liverpool" },
  { name: "Teun Koopmeiners", position: "Orta Saha", number: 14, isCaptain: false, club: "Juventus" },
  { name: "Tijjani Reijnders", position: "Orta Saha", number: 15, isCaptain: false, club: "AC Milan" },
  { name: "Guus Til", position: "Orta Saha", number: 16, isCaptain: false, club: "PSV Eindhoven" },
  { name: "Quinten Timber", position: "Orta Saha", number: 17, isCaptain: false, club: "Feyenoord" },
  { name: "Mats Wieffer", position: "Orta Saha", number: 18, isCaptain: false, club: "Brighton" },
  { name: "Justin Kluivert", position: "Orta Saha", number: 19, isCaptain: false, club: "Bournemouth" },
  { name: "Brian Brobbey", position: "Forvet", number: 20, isCaptain: false, club: "Ajax" },
  { name: "Memphis Depay", position: "Forvet", number: 21, isCaptain: false, club: "Corinthians" },
  { name: "Cody Gakpo", position: "Forvet", number: 22, isCaptain: false, club: "Liverpool" },
  { name: "Noa Lang", position: "Forvet", number: 23, isCaptain: false, club: "PSV Eindhoven" },
  { name: "Donyell Malen", position: "Forvet", number: 24, isCaptain: false, club: "Borussia Dortmund" },
  { name: "Crysencio Summerville", position: "Forvet", number: 25, isCaptain: false, club: "West Ham" },
  { name: "Wout Weghorst", position: "Forvet", number: 26, isCaptain: false, club: "Ajax" },
];

async function syncTeam(teamId, players) {
  console.log(`Syncing ${teamId}...`);
  
  // 1. Delete existing roster
  const { error: deleteError } = await supabase
    .from("team_rosters")
    .delete()
    .eq("team_id", teamId);
    
  if (deleteError) {
    console.error(`Error deleting ${teamId} roster:`, deleteError);
    return;
  }
  
  // 2. Insert new roster
  const rows = players.map(p => ({
    team_id: teamId,
    player_name: p.name,
    player_position: p.position,
    player_number: p.number,
    is_captain: p.isCaptain,
    club: p.club
  }));
  
  const { error: insertError } = await supabase
    .from("team_rosters")
    .insert(rows);
    
  if (insertError) {
    console.error(`Error inserting ${teamId} roster:`, insertError);
  } else {
    console.log(`Successfully synced 26 players for ${teamId}`);
  }
}

async function run() {
  await syncTeam("usa", usaPlayers);
  await syncTeam("ned", nedPlayers);
  console.log("Sync complete!");
}

run();
