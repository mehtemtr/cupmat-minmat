const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'fixtures.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Match all fixtures inside GROUP_FIXTURES
const fixtureRegex = /\{\s*"group":\s*"([^"]+)",\s*"homeTeamId":\s*"([^"]+)",\s*"awayTeamId":\s*"([^"]+)",\s*"date":\s*"([^"]+)",\s*"time":\s*"([^"]+)",\s*(?:"stadium":\s*"[^"]+",\s*)?"id":\s*"([^"]+)"/g;

let match;
console.log("Fixtures in lib/fixtures.ts:");
while ((match = fixtureRegex.exec(content)) !== null) {
  const [_, group, home, away, date, time, id] = match;
  console.log(`Group ${group}: ${home} vs ${away} (${date} ${time}) -> ID: ${id}`);
}
