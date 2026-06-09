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

async function main() {
  const { data: countData, error: countError } = await supabaseAdmin
    .from("team_rosters")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Error fetching count:", countError);
    return;
  }

  console.log(`Total players in team_rosters table: ${countData ? countData.length || 0 : 0}`);

  // Fetch some sample players
  const { data: samples, error: sampleError } = await supabaseAdmin
    .from("team_rosters")
    .select("id, team_id, player_name, player_position")
    .limit(20);

  if (sampleError) {
    console.error("Error fetching samples:", sampleError);
    return;
  }

  console.log("Sample player IDs in database:");
  samples.forEach(p => {
    console.log(`- ID: ${p.id}, Team: ${p.team_id}, Name: ${p.player_name}, Pos: ${p.player_position}`);
  });
}

main();
