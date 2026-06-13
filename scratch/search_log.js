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
    .select('team_name, starters')
    .in('team_name', ['Kadirli Kartalı', 'Saçma Karma']);

  if (error) {
    console.error(error);
    return;
  }

  const logContent = fs.existsSync('rosters_check.log') ? fs.readFileSync('rosters_check.log', 'utf8') : '';
  console.log(`Log size: ${logContent.length} chars.`);

  rosters.forEach(r => {
    console.log(`\nRoster: ${r.team_name}`);
    if (Array.isArray(r.starters)) {
      r.starters.forEach(id => {
        const found = logContent.includes(id);
        console.log(` - Player ID: ${id} | Found in log: ${found}`);
        if (found) {
          // Find the surrounding lines in the log
          const lines = logContent.split('\n');
          const index = lines.findIndex(l => l.includes(id));
          console.log(`   Surrounding context:`);
          for (let i = Math.max(0, index - 2); i <= Math.min(lines.length - 1, index + 2); i++) {
            console.log(`     [Line ${i}]: ${lines[i]}`);
          }
        }
      });
    }
  });
}

run();
