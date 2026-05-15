import { TEAMS, getTeamsByGroup } from "../data/teams";
import { GROUP_IDS } from "../lib/types/tournament";
import { OFFICIAL_GROUP_DRAW } from "../data/official-groups";

let failed = false;

if (TEAMS.length !== 48) {
  console.error(`Expected 48 teams, got ${TEAMS.length}`);
  failed = true;
}

for (const group of GROUP_IDS) {
  const expected = [...OFFICIAL_GROUP_DRAW[group]];
  const actual = getTeamsByGroup(group).map((t) => t.id);
  const ok =
    expected.length === actual.length &&
    expected.every((id, i) => id === actual[i]);

  if (ok) {
    console.log(`Group ${group}: OK — ${actual.join(", ")}`);
  } else {
    console.error(`Group ${group}: MISMATCH`);
    console.error(`  Expected: ${expected.join(", ")}`);
    console.error(`  Actual:   ${actual.join(", ")}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("\nAll 48 official teams validated successfully.");
