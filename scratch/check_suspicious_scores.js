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
    console.log("Fetching suspicious records (level >= 10)...");
    const { data: scores, error } = await supabase
      .from('minmat_leaderboard')
      .select('*')
      .gte('level', 10)
      .order('score', { ascending: false });

    if (error) {
      console.error("Error fetching scores:", error);
      return;
    }

    console.log(`Found ${scores.length} suspicious records.`);
    console.log("----------------------------------------------------------------------");
    console.log("No. | Nickname (Email) | Level | Score | Mode | Date");
    console.log("----------------------------------------------------------------------");
    scores.forEach((item, index) => {
      console.log(`${String(index + 1).padStart(2, ' ')} | ${item.name} (${item.email}) | Lvl: ${item.level} | Score: ${item.score} | Mode: ${item.mode} | Date: ${item.date}`);
    });
    console.log("----------------------------------------------------------------------");

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
