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

process.env.NEXT_PUBLIC_SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
process.env.SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const { getPlayerMapping } = require('./lib/fantasy/points');

async function run() {
  console.log("Running getPlayerMapping to insert missing players...");
  try {
    const mapping = await getPlayerMapping();
    console.log("Mapping finished. Total mapped:", Object.keys(mapping.staticToUuid).length);
  } catch (err) {
    console.error("Mapping failed:", err);
  }
}

run();
