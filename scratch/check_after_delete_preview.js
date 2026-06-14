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
    const { data: scores, error } = await supabase
      .from('minmat_leaderboard')
      .select('*')
      .lt('level', 10) // simulated deletion of level >= 10
      .order('score', { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    console.log("\nPreview of Top 10 Leaderboard after deleting Level >= 10:");
    console.log("----------------------------------------------------------------------");
    scores.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. Nickname: ${item.name} (${item.email})`);
      console.log(`   Score: ${item.score} | Level: ${item.level} | Mode: ${item.mode} | Date: ${item.date}`);
      console.log("----------------------------------------------------------------------");
    });

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
