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
import { getAdjustedTime } from "@/lib/tournament/time-helper";
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

function getDeterministicRewardMinutes(matchId: string, isTurkeyOrLate: boolean) {
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    hash = matchId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const numRewards = isTurkeyOrLate ? 3 : 2;
  const mins: number[] = [];
  let s = Math.abs(hash);
  while (mins.length < numRewards) {
    s = (s * 9301 + 49297) % 233280;
    const min = Math.floor((s / 233280) * 87) + 2; // [2, 88]
    if (!mins.includes(min)) {
      mins.push(min);
    }
  }
  return mins;
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

  // Real clock state for matching schedule simulation
  const [currentRealTime, setCurrentRealTime] = useState(() => getAdjustedTime());
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentRealTime(getAdjustedTime());
    }, 10000); // Check every 10 seconds
    return () => clearInterval(id);
  }, []);

  const getMatchKickoffTime = useCallback((m: MatchResult) => {
    const [hourStr, minStr] = (m.time || "12:00").split(":");
    const [yrStr, moStr, dyStr] = m.date.split("-");
    return new Date(Date.UTC(
      parseInt(yrStr, 10),
      parseInt(moStr, 10) - 1,
      parseInt(dyStr, 10),
      parseInt(hourStr, 10),
      parseInt(minStr, 10),
      0
    )).getTime() - (3 * 60 * 60 * 1000); // Base time is stored in TSİ (UTC+3), convert to UTC
  }, []);

  const simulatedMatches = useMemo(() => {
    return matches;
  }, [matches]);

  const knockoutBracket = useMemo(() => {
    return buildFullKnockoutBracket(simulatedMatches, predictions, groupTableOverrides);
  }, [simulatedMatches, predictions, groupTableOverrides]);

  useEffect(() => {
    const saved = loadState();
    const isFirstVisit = !localStorage.getItem(VERSION_KEY);
    
    // Load matches and preserve played match results from fixtures.ts
    const storedMatches = isFirstVisit 
      ? generateGroupFixtures() 
      : sanitizeStoredMatches(saved.matches);
    
    const freshFixtures = generateGroupFixtures();
    const initialMatches = storedMatches.map(m => {
      const fresh = freshFixtures.find(f => f.id === m.id);
      const isRealPlayed = !!fresh?.played;
      return {
        ...m,
        homeScore: (isRealPlayed && fresh) ? fresh.homeScore : m.homeScore,
        awayScore: (isRealPlayed && fresh) ? fresh.awayScore : m.awayScore,
        played: isRealPlayed ? true : m.played
      };
    });
      
    const initialPredictions = isFirstVisit 
      ? {} 
      : (saved.predictions ?? {}) as Record<string, { home: number; away: number; source: "user" | "ai" }>;
    
    setMatches(initialMatches);
    setPredictions(initialPredictions);
    setDisplayName(saved.displayName ?? "Guest Predictor");
    setAiEnabled(saved.aiEnabled ?? false);
    setAiAnalyses(saved.aiAnalyses ?? []);
    setGroupTableOverrides((saved.groupTableOverrides ?? {}) as Record<GroupId, string[]>);
    
    setReady(true);

    // Fetch and merge live scores from Football-Data.org proxy API
    fetch("/api/live-scores")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.matches)) {
          console.log(`[TournamentContext] Merging ${data.matches.length} live scores...`);
          setMatches((prevMatches) => {
            return prevMatches.map((m) => {
              const liveMatch = data.matches.find((lm: any) => lm.id === m.id);
              if (liveMatch) {
                const isPlayed = liveMatch.played;
                const isLive = liveMatch.isLive;
                return {
                  ...m,
                  homeScore: (isPlayed || isLive) ? liveMatch.homeScore : m.homeScore,
                  awayScore: (isPlayed || isLive) ? liveMatch.awayScore : m.awayScore,
                  played: isPlayed,
                  isLive: isLive,
                };
              }
              return m;
            });
          });
        }
      })
      .catch((err) => console.error("Failed to load live scores from API:", err));
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
        

        
        return next;
      });
    },
    [matches, groupTableOverrides],
  );

  const resetPredictions = useCallback(() => {
    setPredictions({});
    setAiAnalyses([]);
    setAiEnabled(false);
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
      return nextOverrides;
    });
  }, [matches, predictions]);

  const resetGroupOrder = useCallback((groupId: GroupId) => {
    setGroupTableOverrides((prev) => {
      const nextOverrides = { ...prev };
      delete nextOverrides[groupId];
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


      
      return nextMatches;
    });
  }, [predictions, groupTableOverrides]);

  const toggleAiPredictions = useCallback((targetMatchIds?: string[]) => {
    setAiEnabled((prevAi) => {
      const nextAi = !prevAi;
      if (nextAi || targetMatchIds) {
        const isGroupsComplete = allGroupsComplete(simulatedMatches, groupTableOverrides);
        
        // Determine which matches to predict
        let matchesToPredict: { id: string; homeTeamId: string | null; awayTeamId: string | null }[] = [];
        
        if (targetMatchIds) {
          // If specific IDs provided, only predict those
          const allPotential = [...simulatedMatches, ...knockoutBracket];
          matchesToPredict = allPotential.filter(m => targetMatchIds.includes(m.id));
        } else {
          // Default: predict what makes sense for current progress
          matchesToPredict = !isGroupsComplete 
            ? simulatedMatches 
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
      }
      return targetMatchIds ? prevAi : nextAi; // Don't toggle global AI state if just predicting specific round
    });
  }, [simulatedMatches, locale, predictions, knockoutBracket, groupTableOverrides]);

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
    const points = totalPredictionPoints(predictions, simulatedMatches);
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        displayName,
        matchPredictions: predictions,
        points,
        groupsComplete: allGroupsComplete(simulatedMatches),
      }),
    });
  }, [predictions, simulatedMatches, displayName]);

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

    // Clear simulation reward states for manual simulation runs
    updateSimRewardMinutes([]);
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



  // Global background simulation clock (simplified, no rewards)
  useEffect(() => {
    if (!simRunning || !simMatchId) return;

    const intervalId = setInterval(() => {
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

  // Active reward countdown timer (runs whenever there is an active reward popup)
  useEffect(() => {
    if (!activeReward) return;

    const intervalId = setInterval(() => {
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
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeReward]);

  // Real-world live match reward trigger check
  useEffect(() => {
    if (simRunning) return; // Skip if user is running manual simulation

    // Find currently active real live match (if any)
    const liveMatch = simulatedMatches.find(m => m.isLive);
    if (!liveMatch) return;

    const isTurkeyMatch =
      String(liveMatch.homeTeamId || "").toLowerCase() === "tur" ||
      String(liveMatch.awayTeamId || "").toLowerCase() === "tur";

    const stageStr = String(liveMatch.id || "").toLowerCase();
    const isLateKnockout =
      stageStr.includes("quarter") ||
      stageStr.includes("semi") ||
      stageStr.includes("final") ||
      stageStr.includes("qf") ||
      stageStr.includes("sf");

    const rewardMins = getDeterministicRewardMinutes(liveMatch.id, isTurkeyMatch || isLateKnockout);
    
    if (JSON.stringify(simRewardMinutes) !== JSON.stringify(rewardMins)) {
      updateSimRewardMinutes(rewardMins);
    }

    const currentMin = liveMatch.elapsedMin || 0;

    // Trigger reward popups if the match minute matches and user hasn't claimed/missed it
    if (
      rewardMins.includes(currentMin) &&
      !claimedMinutesRef.current.includes(currentMin) &&
      !missedMinutesRef.current.includes(currentMin) &&
      (!activeRewardRef.current || activeRewardRef.current.minute !== currentMin)
    ) {
      const rewardTypes: Array<"time" | "life" | "score"> = ["time", "life", "score"];
      const randomType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
      
      updateActiveReward({
        minute: currentMin,
        type: randomType,
        durationLeft: 15, // 15 seconds to claim
      });
    }
  }, [simulatedMatches, simRunning, simRewardMinutes]);

  const standingsByGroup = useMemo(
    () => getGroupStandingsMap(simulatedMatches, predictions, groupTableOverrides),
    [simulatedMatches, predictions, groupTableOverrides],
  );

  const knockoutUnlocked = useMemo(() => {
    return allGroupsComplete(simulatedMatches, groupTableOverrides);
  }, [simulatedMatches, groupTableOverrides]);

  const predictionPoints = useMemo(
    () => totalPredictionPoints(predictions, simulatedMatches),
    [predictions, simulatedMatches],
  );

  const value = useMemo(
    () => ({
      ready,
      matches: simulatedMatches,
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
      simulatedMatches,
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
