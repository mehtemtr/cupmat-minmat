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
  const id = '4e3aa36e-2c60-41f8-9a35-68043a1a29db';
  console.log(`Checking if ID ${id} exists in team_rosters...`);
  const { data: p, error: err1 } = await supabase.from('team_rosters').select('*').eq('id', id).maybeSingle();
  console.log("Player:", p, err1 || '');

  console.log(`Checking in player_stage_stats...`);
  const { data: s, error: err2 } = await supabase.from('player_stage_stats').select('*').eq('player_id', id);
  console.log("Stats:", s, err2 || '');
}

run();
