const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require("path");

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
  const { data: rosters } = await supabase
    .from('fantasy_rosters')
    .select('*')
    .eq('stage', 'quarter_finals');

  console.log("Quarter Finals rosters starters:");
  for (const r of rosters || []) {
    console.log(`Team: ${r.team_name}, Starters count: ${r.starters?.length}`);
    if (r.starters && r.starters.length > 0) {
      // Check if any of these starters have points in player_stage_stats for quarter_finals
      const { data: stats } = await supabase
        .from('player_stage_stats')
        .select('*')
        .eq('stage', 'quarter_finals')
        .in('player_id', r.starters);
      
      console.log(`  Matching starters with stats: ${stats?.length || 0}`);
      if (stats && stats.length > 0) {
        stats.forEach(s => {
          console.log(`    Player ID: ${s.player_id}, Points: ${s.points}`);
        });
      }
    }
  }
}

run();
