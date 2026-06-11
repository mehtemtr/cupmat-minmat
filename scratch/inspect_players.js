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

const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const teams = ['mex', 'rsa'];
  for (const team of teams) {
    const { data, error } = await supabase
      .from('team_rosters')
      .select('id, player_name, player_position, team_id')
      .eq('team_id', team);
    if (error) {
      console.error(`Error for ${team}:`, error.message);
    } else {
      console.log(`Roster for ${team} (${data.length} players):`);
      data.forEach(p => console.log(`  ${p.id} - ${p.player_name} (${p.player_position})`));
    }
  }
}

run();
