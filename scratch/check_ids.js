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
    .select('starters')
    .eq('stage', 'quarter_finals')
    .limit(1);

  console.log("Starters ID type in fantasy_rosters:", rosters[0]?.starters);

  const { data: stats } = await supabase
    .from('player_stage_stats')
    .select('player_id')
    .eq('stage', 'quarter_finals')
    .limit(5);

  console.log("Player ID type in player_stage_stats:", stats);
}

run();
