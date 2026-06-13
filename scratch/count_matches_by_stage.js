const { generateGroupFixtures } = require('../lib/fixtures');

function getMatchesForStage(stage, allMatches) {
  return allMatches.filter((m) => {
    const dateStr = m.date;
    if (!dateStr) return false;
    if (stage === "matchday_1") {
      return dateStr >= "2026-06-08" && dateStr <= "2026-06-12";
    } else if (stage === "matchday_2") {
      return dateStr >= "2026-06-13" && dateStr <= "2026-06-17";
    } else if (stage === "matchday_3") {
      return dateStr >= "2026-06-18" && dateStr <= "2026-06-22";
    }
    return false;
  });
}

const allMatches = generateGroupFixtures();
console.log(`Total Group Stage Matches: ${allMatches.length}`);
console.log(`Matchday 1 Matches: ${getMatchesForStage('matchday_1', allMatches).length}`);
console.log(`Matchday 2 Matches: ${getMatchesForStage('matchday_2', allMatches).length}`);
console.log(`Matchday 3 Matches: ${getMatchesForStage('matchday_3', allMatches).length}`);

// Print some matchday_1 and matchday_2 matches
const md1 = getMatchesForStage('matchday_1', allMatches);
console.log("\nMatchday 1 Matches List:");
md1.forEach(m => console.log(` - [${m.group}] ${m.homeTeamId} vs ${m.awayTeamId} (${m.date})`));

const md2 = getMatchesForStage('matchday_2', allMatches);
console.log("\nMatchday 2 Matches List:");
md2.slice(0, 10).forEach(m => console.log(` - [${m.group}] ${m.homeTeamId} vs ${m.awayTeamId} (${m.date})`));
console.log(`... and ${md2.length - 10} more matches in Matchday 2.`);
