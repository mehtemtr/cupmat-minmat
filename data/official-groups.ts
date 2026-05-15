import type { GroupId } from "@/lib/types/tournament";

/**
 * Official FIFA World Cup 2026 group draw (48 teams, groups A–L).
 * Order within each array is the official pot/draw slot order.
 */
export const OFFICIAL_GROUP_DRAW: Record<GroupId, readonly string[]> = {
  A: ["mex", "kor", "cze", "rsa"],
  B: ["can", "sui", "bih", "qat"],
  C: ["bra", "sco", "mar", "hti"],
  D: ["usa", "par", "aus", "tur"],
  E: ["ger", "ecu", "civ", "cuw"],
  F: ["ned", "jpn", "swe", "tun"],
  G: ["bel", "irn", "egy", "nzl"],
  H: ["esp", "uru", "ksa", "cpv"],
  I: ["fra", "nor", "irq", "sen"],
  J: ["arg", "alg", "aut", "jor"],
  K: ["por", "col", "uzb", "cod"],
  L: ["eng", "cro", "pan", "gha"],
};

export const OFFICIAL_TEAM_IDS = Object.values(OFFICIAL_GROUP_DRAW).flat();

export function getDrawOrder(teamId: string): number {
  for (const ids of Object.values(OFFICIAL_GROUP_DRAW)) {
    const index = ids.indexOf(teamId);
    if (index >= 0) return index + 1;
  }
  return 99;
}
