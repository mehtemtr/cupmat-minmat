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

const apiKey = getEnv('API_FOOTBALL_KEY') || getEnv('FOOTBALL_DATA_TOKEN');

async function run() {
  const targetDate = '2026-08-20';
  const url = `https://v3.football.api-sports.io/fixtures?date=${targetDate}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      }
    });
    const data = await res.json();
    const leagues = {};
    for (const f of data.response || []) {
      const lid = f.league.id;
      const lname = f.league.name;
      if (!leagues[lid]) leagues[lid] = lname;
    }
    console.log("Leagues on 2026-08-20:", leagues);
  } catch (err) {
    console.error(err);
  }
}
run();
