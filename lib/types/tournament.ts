export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export const GROUP_IDS: GroupId[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

export type Player = {
  id: string;
  name: string;
  position: string;
  club: string;
  age: number;
};

export type Manager = {
  name: string;
  nationality: string;
  age: number;
  tenure: string;
};

export type Team = {
  id: string;
  code: string;
  nameEn: string;
  nameTr: string;
  fifaRank: number;
  group: GroupId;
  /** Official draw slot order within the group (1–4) */
  drawOrder: number;
  confederation: string;
  flagUrl: string;
  manager: Manager;
  players: Player[];
};

export type MatchResult = {
  id: string;
  group: GroupId;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  date: string; // ISO format or human readable
};

export type StandingRow = {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type KnockoutMatch = {
  id: string;
  round: "r32" | "r16" | "qf" | "sf" | "final";
  slot: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeET?: number | null;
  awayET?: number | null;
  homePen?: number | null;
  awayPen?: number | null;
  winnerId: string | null;
  date: string;
};

export type MatchPrediction = {
  home: number;
  away: number;
  homeET?: number;
  awayET?: number;
  homePen?: number;
  awayPen?: number;
  source: "user" | "ai";
};


export type PredictionSubmission = {
  userId: string;
  displayName: string;
  matchPredictions: Record<string, MatchPrediction>;
  points: number;
  groupsComplete: boolean;
  submittedAt: string;
};

export type AiAnalysis = {
  matchId: string;
  locale: string;
  summary: string;
  keyFactors: string[];
  predictedScoreline: string;
  confidence: number;
  isLiveUpdate?: boolean;
  winProbability?: number;
};
