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

const { syncApiFootballScores } = require('./lib/api-football');

async function run() {
  console.log("Running API-Football sync locally with loaded environment variables...");
  try {
    const logs = await syncApiFootballScores("matchday_1");
    console.log("\nSync Logs:");
    logs.forEach(l => console.log(l));
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

run();
