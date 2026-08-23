const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
process.env.API_FOOTBALL_KEY = getEnv('API_FOOTBALL_KEY') || process.env.FOOTBALL_DATA_TOKEN;
process.env.NEXT_PUBLIC_SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
process.env.SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const scriptCode = `
import { fetchAndStoreDailyMatches } from "./lib/api-football-cupmat";

async function run() {
  const dates = ['2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20'];
  for (const d of dates) {
    console.log("Running for", d);
    try {
      const result = await fetchAndStoreDailyMatches(d);
      console.log("Result:", result.inserted, result.updated);
    } catch (err) {
      console.error(err);
    }
  }
}
run();
`;

fs.writeFileSync('temp_run_cupmat.ts', scriptCode);
try {
  const out = execSync('npx tsx temp_run_cupmat.ts', { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.log(e.stdout);
  console.error(e.stderr);
}
fs.unlinkSync('temp_run_cupmat.ts');
