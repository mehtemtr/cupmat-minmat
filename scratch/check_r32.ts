import { buildFullKnockoutBracket } from "../lib/knockout";
import { generateGroupFixtures } from "../lib/fixtures";

const matches = generateGroupFixtures();
const bracket = buildFullKnockoutBracket(matches, {});
console.log("R32 matches:");
bracket.filter(m => m.round === "r32").forEach(m => {
  console.log(`${m.id}: Home=${m.homeTeamId} Away=${m.awayTeamId}`);
});
