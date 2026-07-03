const fs = require('fs');
const path = require('path');

// Mock getTeamById
const TEAMS = [
  { id: "sui", nameTr: "İsviçre", group: "J" },
  { id: "col", nameTr: "Kolombiya", group: "K" },
  { id: "cpv", nameTr: "Yeşil Burun Adaları", group: "J" },
  { id: "aus", nameTr: "Avustralya", group: "D" },
];

function getTeamById(id) {
  return TEAMS.find(t => t.id === id) || { id, nameTr: id };
}

// Let's inspect the files in d:\2026 dünya\lib\knockout.ts
const knockoutContent = fs.readFileSync(path.join(__dirname, '../lib/knockout.ts'), 'utf8');
console.log("Knockout TS file length:", knockoutContent.length);

// Let's run a simple simulation using ts-node inside node process by requiring ts-node
require('ts-node').register({
  project: path.join(__dirname, '../tsconfig.json')
});

const { buildFullKnockoutBracket } = require('../lib/knockout');
const { generateGroupFixtures } = require('../lib/fixtures');

const matches = generateGroupFixtures();
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
};

const bracket = buildFullKnockoutBracket(matches, predictions, undefined, [{}]);
console.log("Bracket matches total:", bracket.length);
const r16 = bracket.filter(m => m.round === 'r16');
r16.forEach((m, idx) => {
  console.log(`[${idx}] ${m.id} (${m.slot}): Home=${m.homeTeamId} (${getTeamById(m.homeTeamId).nameTr}) vs Away=${m.awayTeamId} (${getTeamById(m.awayTeamId).nameTr})`);
});
