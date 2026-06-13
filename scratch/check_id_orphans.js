const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: rosters, error } = await supabase
    .from('fantasy_rosters')
    .select('id, team_name, stage, starters');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Checking ${rosters.length} rosters for orphaned player IDs...`);
  
  // Get all player IDs in database
  const { data: dbPlayers } = await supabase.from('team_rosters').select('id');
  const dbPlayerIds = new Set(dbPlayers.map(p => p.id));
  console.log(`Loaded ${dbPlayerIds.size} player IDs from team_rosters.`);

  let orphanedRostersCount = 0;
  rosters.forEach(r => {
    if (Array.isArray(r.starters)) {
      const orphans = r.starters.filter(id => !dbPlayerIds.has(id));
      if (orphans.length > 0) {
        orphanedRostersCount++;
        console.log(` - Roster: "${r.team_name}" [${r.stage}] has ${orphans.length}/11 orphaned player IDs!`);
      }
    }
  });

  console.log(`\nTotal rosters with orphaned player IDs: ${orphanedRostersCount}/${rosters.length}`);
}

run();
