const fs = require('fs');
const path = require('path');

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

const token = getEnv('FOOTBALL_DATA_TOKEN');

async function run() {
  if (!token) {
    console.error("No FOOTBALL_DATA_TOKEN found.");
    return;
  }

  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": token }
    });

    if (!res.ok) {
      console.error(`API returned status: ${res.status}`);
      return;
    }

    const data = await res.json();
    const matches = data.matches || [];
    console.log(`Fetched ${matches.length} matches.`);

    // Find a finished or live match and inspect its structure
    const sample = matches.find(m => m.status === 'FINISHED' || m.status === 'IN_PLAY');
    if (sample) {
      console.log("\nSample Match structure:", JSON.stringify(sample, null, 2));
    } else if (matches.length > 0) {
      console.log("\nSample Match (Scheduled) structure:", JSON.stringify(matches[0], null, 2));
    } else {
      console.log("No matches found.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
