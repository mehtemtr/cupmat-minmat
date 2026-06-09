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
  const { count: statsCount, error: statsError } = await supabaseAdmin
    .from('player_stage_stats')
    .select('id', { count: 'exact', head: true });

  if (statsError) {
    console.error("statsError:", statsError);
  } else {
    console.log("player_stage_stats count:", statsCount);
  }

  const { count: rostersCount, error: rostersError } = await supabaseAdmin
    .from('fantasy_rosters')
    .select('id', { count: 'exact', head: true });

  if (rostersError) {
    console.error("rostersError:", rostersError);
  } else {
    console.log("fantasy_rosters count:", rostersCount);
  }
}

main();
