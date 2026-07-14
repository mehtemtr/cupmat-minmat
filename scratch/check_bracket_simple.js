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

const { buildFullKnockoutBracket } = require('../lib/knockout');
const { generateGroupFixtures } = require('../lib/fixtures');

const matches = generateGroupFixtures();
const predictions = {};

const bracket = buildFullKnockoutBracket(matches, predictions, undefined, []);
console.log("Bracket matches total:", bracket.length);
bracket.forEach((m, idx) => {
  console.log(`[${idx}] ${m.id} (${m.slot}): Home=${m.homeTeamId} vs Away=${m.awayTeamId} | Result: ${m.homeScore}-${m.awayScore} | Winner: ${m.winnerId} | Played: ${m.played}`);
});
