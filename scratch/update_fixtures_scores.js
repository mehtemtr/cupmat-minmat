const fs = require('fs');
const path = require('path');

const workspaceDir = path.join(__dirname, '..');
const fixturesPath = path.join(workspaceDir, 'lib', 'fixtures.ts');
const statsPath = path.join(workspaceDir, 'data', 'real-tournament-stats.json');

if (!fs.existsSync(statsPath)) {
  console.error("real-tournament-stats.json not found!");
  process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
let fixturesContent = fs.readFileSync(fixturesPath, 'utf8');

// Loop through all stages (e.g., matchday_1, matchday_2) and update fixtures
let totalUpdated = 0;
Object.keys(stats).forEach(stage => {
  const matches = stats[stage];
  matches.forEach(m => {
    // Locate the object block for this match id
    const regex = new RegExp(
      `(\\{[^\\}]*"id"\\s*:\\s*"${m.matchId}"[^\\}]*\\})`,
      'g'
    );
    
    fixturesContent = fixturesContent.replace(regex, (matchBlock) => {
      let updated = matchBlock
        .replace(/"played"\s*:\s*(true|false)/, `"played": true`)
        .replace(/"homeScore"\s*:\s*(null|\d+)/, `"homeScore": ${m.homeScore}`)
        .replace(/"awayScore"\s*:\s*(null|\d+)/, `"awayScore": ${m.awayScore}`);
      totalUpdated++;
      return updated;
    });
  });
});

fs.writeFileSync(fixturesPath, fixturesContent, 'utf8');
console.log(`Successfully updated lib/fixtures.ts with ${totalUpdated} real match scores from JSON!`);
