export type MinmatMode = "add" | "sub" | "mul" | "div" | "mix";

export interface MinmatCard {
  id: string;
  pairId: string;
  text: string;
  isQuestion: boolean;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MinmatTierInfo {
  tier: number;
  name: string;
  extraSeconds: number;
  multiplier: number;
  className: string;
}

export interface MinmatLeaderboardScore {
  name: string;
  score: number;
  level: number;
  mode: MinmatMode;
  date: string;
  timestamp: number;
}
