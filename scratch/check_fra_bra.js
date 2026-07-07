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
    const { data: fra, error: err1 } = await supabase
      .from('team_rosters')
      .select('player_name, team_id')
      .eq('team_id', 'fra');
      
    const { data: bra, error: err2 } = await supabase
      .from('team_rosters')
      .select('player_name, team_id')
      .eq('team_id', 'bra');
      
    console.log("France players:", (fra || []).map(p => p.player_name));
    console.log("Brazil players:", (bra || []).map(p => p.player_name));
  } catch (err) {
    console.error("Failed running test:", err);
  }
}

run();
