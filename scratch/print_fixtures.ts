import { generateGroupFixtures } from "../lib/fixtures";

async function run() {
  const fixtures = generateGroupFixtures();
  const groups: Record<string, any[]> = {};
  fixtures.forEach(f => {
    if (!groups[f.date]) groups[f.date] = [];
    groups[f.date].push(f);
  });

  console.log("Fixtures by date:");
  Object.keys(groups).sort().forEach(date => {
    console.log(`Date: ${date} (${groups[date].length} matches):`);
    groups[date].forEach(m => {
      console.log(`  - Match ${m.id} (${m.group}): ${m.homeTeamId} vs ${m.awayTeamId} @ ${m.time}`);
    });
  });
}

run();
