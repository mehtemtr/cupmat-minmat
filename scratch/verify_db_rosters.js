const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

let supabaseKey = "";
let supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";

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

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify(teamId) {
  console.log(`\n--- Verification for ${teamId} ---`);
  
  const { data: players, error } = await supabase
    .from("team_rosters")
    .select("player_name, player_position, player_number, is_captain, club")
    .eq("team_id", teamId)
    .order("player_number", { ascending: true });
    
  if (error) {
    console.error(`Error reading ${teamId} players:`, error);
    return;
  }
  
  console.log(`Total players in DB for ${teamId}: ${players.length}`);
  players.forEach(p => {
    console.log(`[${p.player_number}] ${p.player_name} (${p.player_position}) - Club: ${p.club} (Captain: ${p.is_captain})`);
  });
}

async function run() {
  await verify("usa");
  await verify("ned");
}

run();
