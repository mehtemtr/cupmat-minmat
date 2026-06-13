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
  const { count: statsCount, error: err1 } = await supabase
    .from('player_stage_stats')
    .select('*', { count: 'exact', head: true });

  const { count: rostersCount, error: err2 } = await supabase
    .from('team_rosters')
    .select('*', { count: 'exact', head: true });

  console.log(`player_stage_stats row count: ${statsCount}`, err1 || '');
  console.log(`team_rosters row count: ${rostersCount}`, err2 || '');
}

run();
