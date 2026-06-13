const fs = require('fs');
const path = require('path');

const workspaceDir = __dirname;
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

process.env.FOOTBALL_DATA_TOKEN = getEnv('FOOTBALL_DATA_TOKEN');
process.env.NEXT_PUBLIC_SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
process.env.SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const { syncApiFootballScores } = require('../lib/api-football');

async function run() {
  console.log("Syncing matchday_1...");
  try {
    const logs1 = await syncApiFootballScores("matchday_1");
    console.log("Matchday 1 sync logs:");
    logs1.forEach(l => console.log(l));
  } catch (err) {
    console.error("Matchday 1 sync failed:", err);
  }

  console.log("\nSyncing matchday_2...");
  try {
    const logs2 = await syncApiFootballScores("matchday_2");
    console.log("Matchday 2 sync logs:");
    logs2.forEach(l => console.log(l));
  } catch (err) {
    console.error("Matchday 2 sync failed:", err);
  }
}

run();
