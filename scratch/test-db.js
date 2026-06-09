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

const logLines = [];
function log(msg) {
  console.log(msg);
  logLines.push(msg);
}

async function main() {
  log("Fetching current fantasy_rosters for stage matchday_1...");
  const { data: rosters, error } = await supabaseAdmin
    .from('fantasy_rosters')
    .select('id, user_id, team_name, stage');

  if (error) {
    log("Error fetching rosters: " + JSON.stringify(error));
    return;
  }

  log(`Found ${rosters.length} rosters in database:`);
  rosters.forEach(r => {
    log(`- ID: ${r.id}, UserID: ${r.user_id}, TeamName: ${r.team_name}, Stage: ${r.stage}`);
  });

  // Clean up any old FanteziKoçu, user_mock, or bot_user rosters
  log("\nCleaning up old mock/test/bot rosters...");
  const oldRosterIdsToDelete = rosters
    .filter(r => r.team_name.includes("FanteziKoçu") || (r.user_id && (r.user_id.startsWith("user_mock") || r.user_id.startsWith("bot_user"))))
    .map(r => r.id);

  if (oldRosterIdsToDelete.length > 0) {
    log(`Deleting rosters with IDs: ${oldRosterIdsToDelete.join(', ')}`);
    const { error: deleteError } = await supabaseAdmin
      .from('fantasy_rosters')
      .delete()
      .in('id', oldRosterIdsToDelete);

    if (deleteError) {
      log("Error deleting rosters: " + JSON.stringify(deleteError));
    } else {
      log("Successfully deleted old rosters!");
    }
  } else {
    log("No old rosters to delete.");
  }

  // Fetch profiles to check bot profile insertion
  log("\nChecking bot profiles in 'profiles' table...");
  const { data: profiles, error: profsError } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, nickname, email');

  if (profsError) {
    log("Error fetching profiles: " + JSON.stringify(profsError));
    return;
  }

  log(`Found ${profiles.length} profiles:`);
  profiles.forEach(p => {
    log(`- ID: ${p.id}, UserID: ${p.user_id}, Nickname: ${p.nickname}, Email: ${p.email}`);
  });

  fs.writeFileSync(path.join(__dirname, 'db-log.txt'), logLines.join('\n'), 'utf8');
}

main();
