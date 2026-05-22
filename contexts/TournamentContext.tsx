"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AiAnalysis,
  GroupId,
  KnockoutMatch,
  MatchPrediction,
  MatchResult,
} from "@/lib/types/tournament";
import { generateGroupFixtures } from "@/lib/fixtures";
import { sanitizeStoredMatches } from "@/lib/tournament/sanitize-matches";
import { TOURNAMENT_DATA_VERSION } from "@/data/teams";
import {
  allGroupsComplete,
  buildFullKnockoutBracket,
  getGroupStandingsMap,
} from "@/lib/knockout";
import { generateAiPredictions } from "@/lib/ai-predictions";
import { simulateLiveUpdate } from "@/lib/ai-live-fetcher";
import { useLocale } from "@/contexts/LocaleContext";
import { totalPredictionPoints } from "@/lib/predictions/scoring";

const STORAGE_KEY = "wc2026-tournament-state";
const VERSION_KEY = "wc2026-tournament-version";

type TournamentState = {
  matches: MatchResult[];
  predictions: Record<string, MatchPrediction>;
  displayName: string;
  aiEnabled: boolean;
  aiAnalyses: AiAnalysis[];
};

function initMatchesFromStorage(): MatchResult[] {
  if (typeof window === "undefined") {
    return generateGroupFixtures();
  }

  const savedVersion = localStorage.getItem(VERSION_KEY);
  if (savedVersion !== TOURNAMENT_DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(VERSION_KEY, TOURNAMENT_DATA_VERSION);
  }

  const saved = loadState();
  return sanitizeStoredMatches(saved.matches);
}

export type TournamentContextValue = {
  ready: boolean;
  matches: MatchResult[];
  predictions: Record<string, MatchPrediction>;
  displayName: string;
  aiEnabled: boolean;
  aiAnalyses: AiAnalysis[];
  standingsByGroup: ReturnType<typeof getGroupStandingsMap>;
  knockoutUnlocked: boolean;
  knockoutBracket: KnockoutMatch[];
  updateMatchScore: (
    matchId: string,
    home: number,
    away: number,
  ) => void;
  setPrediction: (
    matchId: string,
    home: number,
    away: number,
    et?: { home: number; away: number },
    pen?: { home: number; away: number }
  ) => void;
  resetPredictions: () => void;
  setDisplayName: (name: string) => void;
  applyPredictionsToMatches: () => void;
  toggleAiPredictions: (targetMatchIds?: string[]) => void;
  simulateRandomLiveNews: (currentGroup: GroupId) => void;
  submitToLeaderboard: () => Promise<void>;
  predictionPoints: number;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

function loadState(): Partial<TournamentState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<TournamentState>) : {};
  } catch {
    return {};
  }
}

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [matches, setMatches] = useState<MatchResult[]>(generateGroupFixtures);
  const [predictions, setPredictions] = useState<
    Record<
      string,
      {
        home: number;
        away: number;
        homeET?: number;
        awayET?: number;
        homePen?: number;
        awayPen?: number;
        source: "user" | "ai";
      }
    >
  >({});
  const [displayName, setDisplayName] = useState("Guest Predictor");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiAnalyses, setAiAnalyses] = useState<AiAnalysis[]>([]);
  const [ready, setReady] = useState(false);
  const [knockoutBracket, setKnockoutBracket] = useState<KnockoutMatch[]>([]);

  useEffect(() => {
    const saved = loadState();
    const isFirstVisit = !localStorage.getItem(VERSION_KEY);
    
    // Load matches but CLEAR all scores and played status to ensure fresh start
    // Standings will be driven by 'predictions' state automatically
    const storedMatches = isFirstVisit 
      ? generateGroupFixtures() 
      : sanitizeStoredMatches(saved.matches);
    
    const initialMatches = storedMatches.map(m => ({
      ...m,
      homeScore: null,
      awayScore: null,
      played: false
    }));
      
    const initialPredictions = isFirstVisit 
      ? {} 
      : (saved.predictions ?? {}) as Record<string, { home: number; away: number; source: "user" | "ai" }>;
    
    setMatches(initialMatches);
    setPredictions(initialPredictions);
    setDisplayName(saved.displayName ?? "Guest Predictor");
    setAiEnabled(saved.aiEnabled ?? false);
    setAiAnalyses(saved.aiAnalyses ?? []);
    
    if (allGroupsComplete(initialMatches) && Object.keys(initialPredictions).length > 0) {
      setKnockoutBracket(buildFullKnockoutBracket(initialMatches, initialPredictions));
    }
    
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const state: TournamentState = {
      matches,
      predictions,
      displayName,
      aiEnabled,
      aiAnalyses,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(VERSION_KEY, TOURNAMENT_DATA_VERSION);
  }, [matches, predictions, displayName, aiEnabled, aiAnalyses, ready]);

  const updateMatchScore = useCallback(
    (matchId: string, home: number, away: number) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                homeScore: home,
                awayScore: away,
                played: true,
              }
            : m,
        ),
      );
    },
    [],
  );

  const setPrediction = useCallback(
    (matchId: string, home: number, away: number, et?: { home: number; away: number }, pen?: { home: number; away: number }) => {
      setPredictions((prev) => {
        const next = {
          ...prev,
          [matchId]: { 
            home, 
            away, 
            homeET: et?.home, 
            awayET: et?.away, 
            homePen: pen?.home, 
            awayPen: pen?.away,
            source: "user" as const 
          },
        };
        
        if (allGroupsComplete(matches)) {
          setKnockoutBracket(buildFullKnockoutBracket(matches, next));
        }
        
        return next;
      });
    },
    [matches],
  );

  const resetPredictions = useCallback(() => {
    setPredictions({});
    setAiAnalyses([]);
    setAiEnabled(false);
    setKnockoutBracket([]);
    // Completely reset matches state - clear all scores and played status
    setMatches((prev) => prev.map(m => ({ 
      ...m, 
      homeScore: null, 
      awayScore: null, 
      played: false 
    })));
  }, []);

  const applyPredictionsToMatches = useCallback(() => {
    setMatches((prev) => {
      const nextMatches = prev.map((m) => {
        const p = predictions[m.id];
        if (!p) return m;
        return {
          ...m,
          homeScore: p.home,
          awayScore: p.away,
          played: true,
        };
      });

      // Update bracket when applying group predictions
      if (allGroupsComplete(nextMatches)) {
        setKnockoutBracket(buildFullKnockoutBracket(nextMatches, predictions));
      }
      
      return nextMatches;
    });
  }, [predictions]);

  const toggleAiPredictions = useCallback((targetMatchIds?: string[]) => {
    setAiEnabled((prevAi) => {
      const nextAi = !prevAi;
      if (nextAi || targetMatchIds) {
        const isGroupsComplete = allGroupsComplete(matches);
        
        // Determine which matches to predict
        let matchesToPredict: { id: string; homeTeamId: string | null; awayTeamId: string | null }[] = [];
        
        if (targetMatchIds) {
          // If specific IDs provided, only predict those
          const allPotential = [...matches, ...knockoutBracket];
          matchesToPredict = allPotential.filter(m => targetMatchIds.includes(m.id));
        } else {
          // Default: predict what makes sense for current progress
          matchesToPredict = !isGroupsComplete 
            ? matches 
            : knockoutBracket.filter(m => m.homeTeamId && m.awayTeamId);
        }

        const { predictions: aiPreds, analyses } = generateAiPredictions(
          matchesToPredict,
          locale,
        );
        
        const sourceAiPreds = Object.fromEntries(
          Object.entries(aiPreds).map(([id, p]) => [
            id,
            { ...p, source: "ai" as const },
          ]),
        );

        const nextPredictions = { ...predictions, ...sourceAiPreds };
        setPredictions(nextPredictions);
        setAiAnalyses((prev) => [...prev, ...analyses]);

        // Explicitly update bracket after AI prediction if in knockout phase
        if (isGroupsComplete) {
          setKnockoutBracket(buildFullKnockoutBracket(matches, nextPredictions));
        }
      }
      return targetMatchIds ? prevAi : nextAi; // Don't toggle global AI state if just predicting specific round
    });
  }, [matches, locale, predictions, knockoutBracket]);

  const simulateRandomLiveNews = useCallback((currentGroup: GroupId) => {
    if (!aiEnabled) return;

    const groupMatches = matches.filter((m) => m.group === currentGroup);
    if (groupMatches.length === 0) return;

    // Pick 1 random match from the group
    const randomMatch = groupMatches[Math.floor(Math.random() * groupMatches.length)];
    const currentAnalysis = aiAnalyses.find((a) => a.matchId === randomMatch.id);
    const currentPrediction = predictions[randomMatch.id];

    if (!currentAnalysis || !currentPrediction) return;

    const { updatedAnalysis, updatedPrediction } = simulateLiveUpdate(
      currentAnalysis,
      randomMatch,
      currentPrediction,
      locale
    );

    setAiAnalyses((prev) =>
      prev.map((a) => (a.matchId === randomMatch.id ? updatedAnalysis : a))
    );
    setPredictions((prev) => ({
      ...prev,
      [randomMatch.id]: updatedPrediction,
    }));
  }, [aiEnabled, matches, aiAnalyses, predictions, locale]);

  const submitToLeaderboard = useCallback(async () => {
    const points = totalPredictionPoints(predictions, matches);
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        displayName,
        matchPredictions: predictions,
        points,
        groupsComplete: allGroupsComplete(matches),
      }),
    });
  }, [predictions, matches, displayName]);

  const standingsByGroup = useMemo(
    () => getGroupStandingsMap(matches, predictions),
    [matches, predictions],
  );

  const knockoutUnlocked = useMemo(() => {
    // Groups are complete AND at least one group prediction exists
    const groupsDone = allGroupsComplete(matches);
    const hasPredictions = Object.keys(predictions).some(id => !id.startsWith('r32') && !id.startsWith('r16') && !id.startsWith('qf') && !id.startsWith('sf') && !id.startsWith('final'));
    return groupsDone && hasPredictions;
  }, [matches, predictions]);

  const predictionPoints = useMemo(
    () => totalPredictionPoints(predictions, matches),
    [predictions, matches],
  );

  const value = useMemo(
    () => ({
      ready,
      matches,
      predictions,
      displayName,
      aiEnabled,
      aiAnalyses,
      standingsByGroup,
      knockoutUnlocked,
      knockoutBracket,
      updateMatchScore,
      setPrediction,
      resetPredictions,
      setDisplayName,
      applyPredictionsToMatches,
      toggleAiPredictions,
      simulateRandomLiveNews,
      submitToLeaderboard,
      predictionPoints,
    }),
    [
      ready,
      matches,
      predictions,
      displayName,
      aiEnabled,
      aiAnalyses,
      standingsByGroup,
      knockoutUnlocked,
      knockoutBracket,
      updateMatchScore,
      setPrediction,
      resetPredictions,
      setDisplayName,
      applyPredictionsToMatches,
      toggleAiPredictions,
      simulateRandomLiveNews,
      submitToLeaderboard,
      predictionPoints,
    ],
  );

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error("useTournament must be used within TournamentProvider");
  }
  return ctx;
}

export function useGroupStandings(group: GroupId) {
  const { standingsByGroup } = useTournament();
  return standingsByGroup[group] ?? [];
}
