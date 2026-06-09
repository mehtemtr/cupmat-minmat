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
  const { data, error } = await supabaseAdmin
    .from('fantasy_rosters')
    .select('user_id, team_name, starters, bench, formation')
    .like('user_id', 'bot_%');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${data.length} bot rosters:`);
  data.forEach(r => {
    console.log(`- Team: ${r.team_name} (User: ${r.user_id})`);
    console.log(`  Formation: ${r.formation}`);
    console.log(`  Starters Count: ${r.starters ? r.starters.length : 0}`);
    console.log(`  Bench: ${JSON.stringify(r.bench)}`);
  });
}

main();
