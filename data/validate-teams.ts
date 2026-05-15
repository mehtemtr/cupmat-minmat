import { GROUP_IDS } from "@/lib/types/tournament";
import { OFFICIAL_GROUP_DRAW, OFFICIAL_TEAM_IDS } from "@/data/official-groups";
import type { Team } from "@/lib/types/tournament";

export function validateTeamsData(teams: Team[]): void {
  if (teams.length !== 48) {
    throw new Error(`Expected 48 teams, found ${teams.length}`);
  }

  const ids = new Set(teams.map((t) => t.id));
  if (ids.size !== 48) {
    throw new Error("Duplicate team IDs detected");
  }

  for (const officialId of OFFICIAL_TEAM_IDS) {
    if (!ids.has(officialId)) {
      throw new Error(`Missing official team: ${officialId}`);
    }
  }

  for (const group of GROUP_IDS) {
    const expected = [...OFFICIAL_GROUP_DRAW[group]];
    const actual = teams
      .filter((t) => t.group === group)
      .sort((a, b) => a.drawOrder - b.drawOrder)
      .map((t) => t.id);

    if (expected.length !== 4) {
      throw new Error(`Group ${group} must have 4 teams`);
    }

    const expectedSet = new Set(expected);
    const actualSet = new Set(actual);
    if (
      expected.length !== actual.length ||
      !expected.every((id) => actualSet.has(id))
    ) {
      throw new Error(
        `Group ${group} mismatch.\nExpected: ${expected.join(", ")}\nActual: ${actual.join(", ")}`,
      );
    }
  }
}
