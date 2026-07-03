import { generateGroupFixtures } from "../lib/fixtures";
import { buildFullKnockoutBracket } from "../lib/knockout";

const predictions = {
  "r32-1": { home: 1, away: 1, homeET: 0, awayET: 0, homePen: 3, awayPen: 4, source: "user" },
  "r32-2": { home: 3, away: 0, source: "user" },
  "r32-3": { home: 0, away: 1, source: "user" },
  "r32-4": { home: 1, away: 1, homeET: 0, awayET: 0, homePen: 2, awayPen: 3, source: "user" },
  "r32-5": { home: 2, away: 1, source: "user" },
  "r32-6": { home: 3, away: 0, source: "user" },
  "r32-7": { home: 2, away: 0, source: "user" },
  "r32-8": { home: 3, away: 2, source: "user" },
  "r32-9": { home: 2, away: 1, source: "user" },
  "r32-10": { home: 1, away: 2, source: "user" },
  "r32-11": { home: 2, away: 0, source: "user" },
  "r32-12": { home: 3, away: 3, homeET: 0, awayET: 0, homePen: 0, awayPen: 1, source: "user" },
  "r32-13": { home: 1, away: 2, source: "user" },
  "r32-14": { home: 1, away: 1, homeET: 1, awayET: 0, source: "user" },
  "r32-15": { home: 2, away: 1, source: "user" },
  "r32-16": { home: 2, away: 1, source: "user" },
  "r16-7": { home: 1, away: 2, source: "user" }, // Colombia wins
  "r16-8": { home: 3, away: 1, source: "user" }, // Argentina wins
};

const bracket = buildFullKnockoutBracket(generateGroupFixtures(), predictions, undefined, [{}]);
console.log("--- ROUND OF 32 ---");
bracket.filter(m => m.round === 'r32').forEach((m, idx) => {
  console.log(`[${idx}] ${m.id} (${m.slot}): Home=${m.homeTeamId} vs Away=${m.awayTeamId} (winner: ${m.winnerId || "TBD"})`);
});

console.log("\n--- ROUND OF 16 ---");
bracket.filter(m => m.round === 'r16').forEach((m, idx) => {
  console.log(`[${idx}] ${m.id} (${m.slot}): Home=${m.homeTeamId} vs Away=${m.awayTeamId}`);
});

console.log("\n--- QUARTER FINALS ---");
bracket.filter(m => m.round === 'qf').forEach((m, idx) => {
  console.log(`[${idx}] ${m.id} (${m.slot}): Home=${m.homeTeamId} vs Away=${m.awayTeamId}`);
});
