const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    console.log("Searching profiles for 'Kartal1903' or similar...");
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .or('nickname.ilike.%kartal%');

    if (pErr) {
      console.error("Error fetching profiles:", pErr);
      return;
    }

    console.log(`Found ${profiles.length} profiles matching 'kartal':`);
    profiles.forEach(p => {
      console.log(`ID: ${p.id} | Email: ${p.email} | Nickname: ${p.nickname}`);
    });

    console.log("\nLet's check all fantasy rosters in the database:");
    console.log("--------------------------------------------------");
    const { data: rosters, error: rErr } = await supabase
      .from('fantasy_rosters')
      .select('*');

    if (rErr) {
      console.error("Error fetching rosters:", rErr);
      return;
    }

    console.log(`Total rosters in database: ${rosters.length}`);
    rosters.forEach(r => {
      // Find profile for user_id
      const prof = profiles.find(p => p.id === r.user_id);
      const userNick = prof ? prof.nickname : r.user_id;
      console.log(`Roster ID: ${r.id} | User: ${userNick} | Team Name: ${r.team_name} | Stage: ${r.stage} | Index: ${r.team_index} | Points: ${r.points} | Starters Count: ${r.starters ? r.starters.length : 0}`);
    });
    console.log("--------------------------------------------------");

    console.log("\nLet's check all duels in the database:");
    console.log("--------------------------------------------------");
    const { data: duels, error: dErr } = await supabase
      .from('fantasy_duels')
      .select('*');

    if (dErr) {
      console.error("Error fetching duels:", dErr);
      return;
    }

    console.log(`Total duels in database: ${duels.length}`);
    duels.forEach(d => {
      console.log(`Duel ID: ${d.id} | Stage: ${d.stage} | Roster 1: ${d.roster_id_1} | Roster 2: ${d.roster_id_2} | Score: ${d.score_1} - ${d.score_2} | Result: ${d.result}`);
    });
    console.log("--------------------------------------------------");

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
