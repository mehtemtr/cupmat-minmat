import { buildFullKnockoutBracket } from "../lib/knockout";
import { generateGroupFixtures } from "../lib/fixtures";

const matches = generateGroupFixtures();
const bracket = buildFullKnockoutBracket(matches, {});
console.log("All knockout matches:");
bracket.forEach(m => {
  console.log(`${m.round} - ${m.id} (${m.slot}): Home=${m.homeTeamId} (${m.homeScore}) vs Away=${m.awayTeamId} (${m.awayScore}) [ET: ${m.homeET}-${m.awayET}, Pen: ${m.homePen}-${m.awayPen}] - Winner=${m.winnerId}`);
});
