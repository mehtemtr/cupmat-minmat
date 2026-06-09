const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    envVars[key] = value.trim();
  }
});

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const { getAllPlayers } = require('../data/teams');

async function main() {
  const staticPlayers = getAllPlayers();
  const staticVanDijk = staticPlayers.find(p => p.name.includes("van Dijk"));
  console.log("Static Van Dijk:", staticVanDijk);

  const { data: dbVanDijk } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .eq("team_id", "ned")
    .like("player_name", "%van Dijk%");
  console.log("DB Van Dijk:", dbVanDijk);

  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]/g, "");
  };

  if (staticVanDijk && dbVanDijk && dbVanDijk.length > 0) {
    const sNorm = normalizeName(staticVanDijk.name);
    const dNorm = normalizeName(dbVanDijk[0].player_name);
    console.log("Static Normalized:", sNorm);
    console.log("DB Normalized:", dNorm);
    console.log("Match?", sNorm === dNorm);
  }
}

main();
