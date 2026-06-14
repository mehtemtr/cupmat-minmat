const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
  try {
    console.log("Starting deletion of Kartal1903's score of 6842...");
    const { data, error, count } = await supabase
      .from('minmat_leaderboard')
      .delete({ count: 'exact' })
      .eq('name', 'Kartal1903')
      .eq('score', 6842)
      .eq('level', 7);

    if (error) {
      console.error("Error deleting record:", error);
      return;
    }

    console.log(`Successfully deleted ${count} record(s) matching Kartal1903's 6842 score.`);

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
