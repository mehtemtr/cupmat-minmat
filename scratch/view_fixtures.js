const { generateGroupFixtures } = require('./lib/fixtures');
const fixtures = generateGroupFixtures();
const m1 = fixtures.filter(f => f.stage === 'matchday_1');
console.log("Matchday 1 matches:");
m1.forEach(f => {
  console.log(`${f.id} (Group ${f.group}): ${f.homeTeamId} vs ${f.awayTeamId} on ${f.date} at ${f.time}`);
});
