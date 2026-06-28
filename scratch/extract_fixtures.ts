import { generateGroupFixtures } from "../lib/fixtures";
import fs from "fs";
import path from "path";

const fixtures = generateGroupFixtures();
const simplified = fixtures.map(f => ({
  group: f.group,
  homeTeamId: f.homeTeamId,
  awayTeamId: f.awayTeamId,
  id: f.id
}));

const outputPath = path.join(__dirname, "../data/fixtures-list.json");
fs.writeFileSync(outputPath, JSON.stringify(simplified, null, 2), "utf8");
console.log(`Successfully extracted ${simplified.length} fixtures to data/fixtures-list.json!`);
