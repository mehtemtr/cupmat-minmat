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
      .select('mode, name, score');

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    const counts = {};
    const samplePlayers = {};
    
    scores.forEach(item => {
      const mode = item.mode || 'unknown';
      counts[mode] = (counts[mode] || 0) + 1;
      
      if (!samplePlayers[mode]) {
        samplePlayers[mode] = [];
      }
      if (samplePlayers[mode].length < 3) {
        samplePlayers[mode].push(`${item.name} (${item.score})`);
      }
    });

    console.log("Category breakdown in minmat_leaderboard:");
    console.log("-------------------------------------------");
    for (const [mode, count] of Object.entries(counts)) {
      console.log(`Mode: ${mode.padEnd(12, ' ')} | Count: ${String(count).padStart(3, ' ')} | Samples: ${samplePlayers[mode].join(', ')}`);
    }
    console.log("-------------------------------------------");
  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
