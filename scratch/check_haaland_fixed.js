const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = __dirname + '/..';
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
    const { data: stats, error } = await supabase
      .from('player_stage_stats')
      .select('player_id, stage, goals, team_rosters!inner(player_name, team_id)')
      .ilike('team_rosters.player_name', '%Diogo Costa%');
      
    if (error) {
      console.error("Error:", error);
      return;
    }
    
    console.log(`Found ${stats.length} records in player_stage_stats for Diogo Costa:`);
    let total = 0;
    stats.forEach(s => {
      console.log(`- Stage: ${s.stage}, Goals: ${s.goals}, Player name: ${s.team_rosters?.player_name}`);
      total += s.goals || 0;
    });
    console.log("Total goals:", total);
  } catch (err) {
    console.error("Failed running test:", err);
  }
}

run();
