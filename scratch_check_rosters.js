const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse environment variables manually
let envText = '';
if (fs.existsSync('.env.local')) envText += fs.readFileSync('.env.local', 'utf8') + '\n';
if (fs.existsSync('.env')) envText += fs.readFileSync('.env', 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing credentials:", { supabaseUrl, hasKey: !!supabaseServiceKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // Check rosters
  const { data: rosters, error: rErr } = await supabase
    .from('fantasy_rosters')
    .select('id, user_id, team_name, stage')
    .eq('stage', 'matchday_1');
  
  if (rErr) {
    console.error("Error fetching rosters:", rErr);
  } else {
    console.log(`Found ${rosters.length} rosters for matchday_1:`);
    rosters.forEach(r => console.log(` - Roster: ${r.id}, User: ${r.user_id}, Team: ${r.team_name}`));
  }

  // Check duels
  const { data: duels, error: dErr } = await supabase
    .from('fantasy_duels')
    .select('id, stage, roster_id_1, roster_id_2')
    .eq('stage', 'matchday_1');

  if (dErr) {
    console.error("Error fetching duels:", dErr);
  } else {
    console.log(`Found ${duels.length} duels for matchday_1:`);
    duels.forEach(d => console.log(` - Duel: ${d.id}, roster1: ${d.roster_id_1}, roster2: ${d.roster_id_2}`));
  }
}

run();
