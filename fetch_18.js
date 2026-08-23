const fs = require('fs');
const envText = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : (fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '');
let key = '';
for (const line of envText.split('\n')) {
  if (line.includes('API_FOOTBALL_KEY=')) key = line.split('=')[1].trim();
  if (line.includes('FOOTBALL_DATA_TOKEN=') && !key) key = line.split('=')[1].trim();
}
key = key.replace(/^['"]|['"]$/g, '');

async function run() {
  const res = await fetch('https://v3.football.api-sports.io/fixtures?date=2026-08-18', {
    headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'v3.football.api-sports.io' }
  });
  const data = await res.json();
  fs.writeFileSync('api_18.json', JSON.stringify(data, null, 2));
}
run();
