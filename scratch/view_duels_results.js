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
  const { data: duels, error } = await supabase
    .from('fantasy_duels')
    .select('id, stage, score_1, score_2, result, roster_id_1, roster_id_2')
    .eq('stage', 'matchday_1');

  if (error) {
    console.error(error);
  } else {
    console.log(`Matchday 1 Duels:`);
    duels.forEach(d => {
      console.log(`Duel ID: ${d.id} | Score 1: ${d.score_1} | Score 2: ${d.score_2} | Result: ${d.result}`);
    });
  }
}

run();
