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
    const { data: players, error } = await supabase
      .from('team_rosters')
      .select('id, player_name, team_id, player_position')
      .or('player_name.ilike.%messi%,player_name.ilike.%mbappe%,player_name.ilike.%haaland%,player_name.ilike.%kane%,player_name.ilike.%vinicius%,player_name.ilike.%costa%,player_name.ilike.%pedersen%');
      
    if (error) {
      console.error("Error:", error);
      return;
    }
    
    console.log(`Found ${players.length} players in team_rosters matching search:`);
    players.forEach(p => {
      console.log(`- ID: ${p.id}, Name: "${p.player_name}" (${p.team_id}), Pos: ${p.player_position}`);
    });
  } catch (err) {
    console.error("Failed running test:", err);
  }
}

run();
