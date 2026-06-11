"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
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
import { TOURNAMENT_DATA_VERSION, getTeamById } from "@/data/teams";
import {
  allGroupsComplete,
  buildFullKnockoutBracket,
  getGroupStandingsMap,
} from "@/lib/knockout";
import { generateAiPredictions } from "@/lib/ai-predictions";
import { simulateLiveUpdate } from "@/lib/ai-live-fetcher";
import { useLocale } from "@/contexts/LocaleContext";
import { totalPredictionPoints } from "@/lib/predictions/scoring";
import { playWhistleSound, playGoalSound, playRewardSound } from "@/lib/audio";
import { generateSimulation } from "@/lib/simulation";

const STORAGE_KEY = "wc2026-tournament-state";
const VERSION_KEY = "wc2026-tournament-version";

type TournamentState = {
  matches: MatchResult[];
  predictions: Record<string, MatchPrediction>;
  displayName: string;
  aiEnabled: boolean;
  aiAnalyses: AiAnalysis[];
  groupTableOverrides?: Record<GroupId, string[]>;
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
  groupTableOverrides: Record<GroupId, string[]>;
  updateGroupOrder: (groupId: GroupId, teamIds: string[]) => void;
  resetGroupOrder: (groupId: GroupId) => void;

  // Global simulation exports
  simMatchId: string | null;
  simRunning: boolean;
  simMinute: number;
  simScore: { home: number; away: number };
  simEvents: any[];
  simAllEvents: any[];
  startSimulation: (match: any) => void;
  stopSimulation: () => void;
  simRewardMinutes: number[];
  simClaimedMinutes: number[];
  simMissedMinutes: number[];
  activeReward: { minute: number; type: "time" | "life" | "score"; durationLeft: number } | null;
  claimReward: (minute: number) => Promise<void>;
  dismissReward: (minute: number) => void;
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
  const [groupTableOverrides, setGroupTableOverrides] = useState<Record<GroupId, string[]>>({} as Record<GroupId, string[]>);

  // Global live simulation states
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  // Simulation Rewards States
  const [simRewardMinutes, setSimRewardMinutes] = useState<number[]>([]);
  const [simClaimedMinutes, setSimClaimedMinutes] = useState<number[]>([]);
  const [simMissedMinutes, setSimMissedMinutes] = useState<number[]>([]);
  const [activeReward, setActiveReward] = useState<{ minute: number; type: "time" | "life" | "score"; durationLeft: number } | null>(null);

  const rewardMinutesRef = useRef<number[]>([]);
  const claimedMinutesRef = useRef<number[]>([]);
  const missedMinutesRef = useRef<number[]>([]);
  const activeRewardRef = useRef<{ minute: number; type: "time" | "life" | "score"; durationLeft: number } | null>(null);

  const updateSimRewardMinutes = (mins: number[]) => {
    rewardMinutesRef.current = mins;
    setSimRewardMinutes(mins);
  };
  const updateSimClaimedMinutes = (mins: number[]) => {
    claimedMinutesRef.current = mins;
    setSimClaimedMinutes(mins);
  };
  const updateSimMissedMinutes = (mins: number[]) => {
    missedMinutesRef.current = mins;
    setSimMissedMinutes(mins);
  };
  const updateActiveReward = (rew: typeof activeRewardRef.current) => {
    activeRewardRef.current = rew;
    setActiveReward(rew);
  };
  const [simMatchId, setSimMatchId] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simMinute, setSimMinute] = useState(1);
  const [simScore, setSimScore] = useState<{ home: number; away: number }>({ home: 0, away: 0 });
  const [simEvents, setSimEvents] = useState<any[]>([]);
  const [simAllEvents, setSimAllEvents] = useState<any[]>([]);

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
    setGroupTableOverrides((saved.groupTableOverrides ?? {}) as Record<GroupId, string[]>);
    
    if (allGroupsComplete(initialMatches, saved.groupTableOverrides) && Object.keys(initialPredictions).length > 0) {
      setKnockoutBracket(buildFullKnockoutBracket(initialMatches, initialPredictions, saved.groupTableOverrides));
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
      groupTableOverrides,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(VERSION_KEY, TOURNAMENT_DATA_VERSION);
  }, [matches, predictions, displayName, aiEnabled, aiAnalyses, groupTableOverrides, ready]);

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
        
        if (allGroupsComplete(matches, groupTableOverrides)) {
          setKnockoutBracket(buildFullKnockoutBracket(matches, next, groupTableOverrides));
        }
        
        return next;
      });
    },
    [matches, groupTableOverrides],
  );

  const resetPredictions = useCallback(() => {
    setPredictions({});
    setAiAnalyses([]);
    setAiEnabled(false);
    setKnockoutBracket([]);
    setGroupTableOverrides({} as Record<GroupId, string[]>);
    // Completely reset matches state - clear all scores and played status
    setMatches((prev) => prev.map(m => ({ 
      ...m, 
      homeScore: null, 
      awayScore: null, 
      played: false 
    })));
  }, []);

  const updateGroupOrder = useCallback((groupId: GroupId, teamIds: string[]) => {
    setGroupTableOverrides((prev) => {
      const nextOverrides = {
        ...prev,
        [groupId]: teamIds,
      };
      setKnockoutBracket(buildFullKnockoutBracket(matches, predictions, nextOverrides));
      return nextOverrides;
    });
  }, [matches, predictions]);

  const resetGroupOrder = useCallback((groupId: GroupId) => {
    setGroupTableOverrides((prev) => {
      const nextOverrides = { ...prev };
      delete nextOverrides[groupId];
      setKnockoutBracket(buildFullKnockoutBracket(matches, predictions, nextOverrides));
      return nextOverrides;
    });
  }, [matches, predictions]);

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
      if (allGroupsComplete(nextMatches, groupTableOverrides)) {
        setKnockoutBracket(buildFullKnockoutBracket(nextMatches, predictions, groupTableOverrides));
      }
      
      return nextMatches;
    });
  }, [predictions, groupTableOverrides]);

  const toggleAiPredictions = useCallback((targetMatchIds?: string[]) => {
    setAiEnabled((prevAi) => {
      const nextAi = !prevAi;
      if (nextAi || targetMatchIds) {
        const isGroupsComplete = allGroupsComplete(matches, groupTableOverrides);
        
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
          setKnockoutBracket(buildFullKnockoutBracket(matches, nextPredictions, groupTableOverrides));
        }
      }
      return targetMatchIds ? prevAi : nextAi; // Don't toggle global AI state if just predicting specific round
    });
  }, [matches, locale, predictions, knockoutBracket, groupTableOverrides]);

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

  const startSimulation = useCallback((match: any) => {
    const homeTeam = getTeamById(match.homeTeamId);
    const awayTeam = getTeamById(match.awayTeamId);
    const homePlayers = homeTeam?.players || [];
    const awayPlayers = awayTeam?.players || [];

    const eventsList = generateSimulation(match, homePlayers, awayPlayers);
    
    setSimMatchId(match.id);
    setSimMinute(1);
    setSimScore({ home: 0, away: 0 });
    setSimAllEvents(eventsList);
    setSimEvents(eventsList.filter(e => e.minute <= 1));
    setSimRunning(true);
    
    // Play kickoff whistle immediately
    playWhistleSound("start");

    // Dynamic Reward Spawn minute generation
    const isTurkeyMatch =
      String(match.homeTeamId || "").toLowerCase() === "tur" ||
      String(match.awayTeamId || "").toLowerCase() === "tur" ||
      String(match.homeTeam?.id || "").toLowerCase() === "tur" ||
      String(match.awayTeam?.id || "").toLowerCase() === "tur";

    const stageStr = String(match.stage || match.id || "").toLowerCase();
    const isLateKnockout =
      stageStr.includes("quarter") ||
      stageStr.includes("semi") ||
      stageStr.includes("final") ||
      stageStr.includes("qf") ||
      stageStr.includes("sf");

    const numRewards = (isTurkeyMatch || isLateKnockout) ? 3 : 2;
    const mins: number[] = [];
    while (mins.length < numRewards) {
      const randomMin = Math.floor(Math.random() * 87) + 2; // [2, 88]
      if (!mins.includes(randomMin)) {
        mins.push(randomMin);
      }
    }
    updateSimRewardMinutes(mins);
    updateSimClaimedMinutes([]);
    updateSimMissedMinutes([]);
    updateActiveReward(null);
  }, []);

  const stopSimulation = useCallback(() => {
    setSimRunning(false);
    setSimMatchId(null);
    setSimMinute(1);
    setSimScore({ home: 0, away: 0 });
    setSimEvents([]);
    setSimAllEvents([]);
    updateSimRewardMinutes([]);
    updateSimClaimedMinutes([]);
    updateSimMissedMinutes([]);
    updateActiveReward(null);
  }, []);

  const claimReward = useCallback(async (minute: number) => {
    const activeRew = activeRewardRef.current;
    if (!activeRew || activeRew.minute !== minute) return;

    try {
      const res = await fetch("/api/fantasy/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardType: activeRew.type }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          updateSimClaimedMinutes([...claimedMinutesRef.current, minute]);
          updateActiveReward(null);
          // Play success chime sound!
          playRewardSound();
        }
      }
    } catch (e) {
      console.error("Error claiming reward:", e);
    }
  }, []);

  const dismissReward = useCallback((minute: number) => {
    const activeRew = activeRewardRef.current;
    if (activeRew && activeRew.minute === minute) {
      updateSimMissedMinutes([...missedMinutesRef.current, minute]);
      updateActiveReward(null);
    }
  }, []);

  // Global background simulation clock
  useEffect(() => {
    if (!simRunning || !simMatchId) return;

    const intervalId = setInterval(() => {
      // If there is an active reward, tick its duration instead of game minutes
      const activeRew = activeRewardRef.current;
      if (activeRew) {
        const nextDur = activeRew.durationLeft - 1;
        if (nextDur <= 0) {
          // Missed!
          updateSimMissedMinutes([...missedMinutesRef.current, activeRew.minute]);
          updateActiveReward(null);
        } else {
          updateActiveReward({
            ...activeRew,
            durationLeft: nextDur,
          });
          return; // Skip incrementing match minute
        }
      }

      setSimMinute((prevMin) => {
        const nextMin = prevMin + 1;
        
        // Play whistle/goal sounds when events occur at nextMin
        const minuteEvents = simAllEvents.filter((ev) => ev.minute === nextMin);
        minuteEvents.forEach((ev) => {
          if (ev.type === "start" || ev.type === "half") {
            playWhistleSound(ev.type);
          } else if (ev.type === "end") {
            playWhistleSound("end");
          } else if (ev.type === "goal") {
            playGoalSound();
          }
        });

        // Trigger reward popups at specific minutes
        const rewardMins = rewardMinutesRef.current;
        if (
          rewardMins.includes(nextMin) &&
          !claimedMinutesRef.current.includes(nextMin) &&
          !missedMinutesRef.current.includes(nextMin)
        ) {
          const rewardTypes: Array<"time" | "life" | "score"> = ["time", "life", "score"];
          const randomType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
          updateActiveReward({
            minute: nextMin,
            type: randomType,
            durationLeft: 15,
          });
        }

        if (nextMin >= 94) {
          setSimRunning(false);
          clearInterval(intervalId);
        }

        const activeEvents = simAllEvents.filter((ev) => ev.minute <= nextMin);
        setSimEvents(activeEvents);

        const scoreEvents = activeEvents.filter((ev) => ev.scoreAfter);
        if (scoreEvents.length > 0) {
          const latestScore = scoreEvents[scoreEvents.length - 1].scoreAfter;
          if (latestScore) {
            setSimScore(latestScore);
          }
        }

        return nextMin;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [simRunning, simMatchId, simAllEvents]);

  const standingsByGroup = useMemo(
    () => getGroupStandingsMap(matches, predictions, groupTableOverrides),
    [matches, predictions, groupTableOverrides],
  );

  const knockoutUnlocked = useMemo(() => {
    return allGroupsComplete(matches, groupTableOverrides);
  }, [matches, groupTableOverrides]);

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
      groupTableOverrides,
      updateGroupOrder,
      resetGroupOrder,
      simMatchId,
      simRunning,
      simMinute,
      simScore,
      simEvents,
      simAllEvents,
      startSimulation,
      stopSimulation,
      simRewardMinutes,
      simClaimedMinutes,
      simMissedMinutes,
      activeReward,
      claimReward,
      dismissReward,
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
      groupTableOverrides,
      updateGroupOrder,
      resetGroupOrder,
      simMatchId,
      simRunning,
      simMinute,
      simScore,
      simEvents,
      simAllEvents,
      startSimulation,
      stopSimulation,
      simRewardMinutes,
      simClaimedMinutes,
      simMissedMinutes,
      activeReward,
      claimReward,
      dismissReward,
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
