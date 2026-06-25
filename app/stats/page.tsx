"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { PageShell } from "@/components/PageShell";
import Link from "next/link";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { useTournament } from "@/contexts/TournamentContext";
import { TEAMS, getTeamById } from "@/data/teams";
import { HISTORICAL_STANDINGS } from "@/data/historical-standings";
import { generateGroupFixtures } from "@/lib/fixtures";
import { getAdjustedTime } from "@/lib/tournament/time-helper";
import {
  Users,
  Award,
  History,
  Activity,
  ArrowUpDown,
  Search,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { playWhistleSound, playGoalSound } from "@/lib/audio";
import { generateSimulation, type SimEvent } from "@/lib/simulation";

interface PlayerStat {
  id: string;
  player_name: string;
  team_id: string;
  player_position: string;
  player_number: number;
  club: string;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  league: string | null;
  age: number | null;
}

interface ClubCount {
  club: string;
  count: number;
}

interface CityCount {
  city: string;
  count: number;
}

interface CountryAverage {
  teamId: string;
  teamNameTr: string;
  teamNameEn: string;
  avgAge: number;
  avgHeight: number;
  avgWeight: number;
  playerCount: number;
}



export default function StatisticsPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"squad" | "live" | "history">("squad");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const {
    matches,
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
  } = useTournament();

  // Real clock state
  const [currentRealTime, setCurrentRealTime] = useState(() => getAdjustedTime());
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentRealTime(getAdjustedTime());
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Reward claims and missed events toast triggers
  const prevClaimedCount = useRef(simClaimedMinutes.length);
  const prevMissedCount = useRef(simMissedMinutes.length);

  useEffect(() => {
    if (simClaimedMinutes.length > prevClaimedCount.current) {
      window.dispatchEvent(
        new CustomEvent("taraftar-puan-guncellendi", {
          detail: { toast: t("fantasy.liveRewardEarned") },
        })
      );
    }
    prevClaimedCount.current = simClaimedMinutes.length;
  }, [simClaimedMinutes, t]);

  useEffect(() => {
    if (simMissedMinutes.length > prevMissedCount.current) {
      window.dispatchEvent(
        new CustomEvent("taraftar-puan-guncellendi", {
          detail: { toast: t("fantasy.liveRewardMissed") },
        })
      );
    }
    prevMissedCount.current = simMissedMinutes.length;
  }, [simMissedMinutes, t]);

  const displayMatches = useMemo(() => {
    // Convert currentRealTime to TSİ (UTC+3) date string
    const tzOffset = 3 * 60 * 60 * 1000;
    const localDate = new Date(currentRealTime + tzOffset);
    const todayStr = localDate.toISOString().split("T")[0]; // e.g. "2026-06-12"

    const activeMatches = matches.filter(m => m.date <= todayStr);
    
    // Sort chronologically by date and time
    const sortedMatches = [...activeMatches].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time || "00:00"}:00Z`;
      const dateTimeB = `${b.date}T${b.time || "00:00"}:00Z`;
      return new Date(dateTimeA).getTime() - new Date(dateTimeB).getTime();
    });

    return sortedMatches.map(m => {
      // 1. If manually simulating
      if (simMatchId && m.id === simMatchId) {
        return {
          ...m,
          homeScore: simScore.home,
          awayScore: simScore.away,
          played: simMinute >= 94,
          isLive: simMinute < 94,
          elapsedMin: simMinute
        };
      }
      return m;
    });
  }, [matches, simMatchId, simScore, simMinute, currentRealTime]);

  const realLiveMatch = useMemo(() => {
    if (simMatchId) return null;
    return displayMatches.find(m => m.isLive);
  }, [displayMatches, simMatchId]);

  // Unified Commentary selectors
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [commentaryClosed, setCommentaryClosed] = useState(false);

  const handleCloseCommentary = () => {
    stopSimulation();
    setSelectedMatchId(null);
    setCommentaryClosed(true);
  };

  const activeCommMatch = useMemo(() => {
    if (simMatchId) {
      return displayMatches.find(m => m.id === simMatchId) || null;
    }
    if (selectedMatchId) {
      return displayMatches.find(m => m.id === selectedMatchId) || null;
    }
    if (realLiveMatch) return realLiveMatch;
    return null;
  }, [simMatchId, selectedMatchId, displayMatches, realLiveMatch]);

  const activeCommEvents = useMemo(() => {
    if (simMatchId) return simEvents;
    if (activeCommMatch) {
      const homeTeam = getTeamById(activeCommMatch.homeTeamId);
      const awayTeam = getTeamById(activeCommMatch.awayTeamId);
      const homePlayers = homeTeam?.players || [];
      const awayPlayers = awayTeam?.players || [];
      const eventsList = generateSimulation(activeCommMatch, homePlayers, awayPlayers);
      return eventsList.filter(e => e.minute <= (activeCommMatch.elapsedMin || 94));
    }
    return [];
  }, [simMatchId, simEvents, activeCommMatch]);

  const activeCommScore = useMemo(() => {
    if (simMatchId) return simScore;
    return { home: activeCommMatch?.homeScore ?? 0, away: activeCommMatch?.awayScore ?? 0 };
  }, [simMatchId, simScore, activeCommMatch]);

  const activeCommMinute = useMemo(() => {
    if (simMatchId) return simMinute;
    return activeCommMatch?.elapsedMin ?? 1;
  }, [simMatchId, simMinute, activeCommMatch]);

  const [dbLeaders, setDbLeaders] = useState<{ scorers: any[]; cards: any[] }>({ scorers: [], cards: [] });
  const [dbLeadersLoading, setDbLeadersLoading] = useState(true);
  // Total goals from all scorers
  const totalGoals = dbLeaders.scorers.reduce((sum: number, s) => sum + (s.goals ?? 0), 0);

  useEffect(() => {
    let active = true;
    const loadLeaders = () => {
      fetch("/api/stats/tournament-leaders")
        .then((res) => res.json())
        .then((data) => {
          if (active && data.success) {
            setDbLeaders({ scorers: data.scorers || [], cards: data.cards || [] });
            setDbLeadersLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load leaders:", err);
          if (active) setDbLeadersLoading(false);
        });
    };

    loadLeaders();
    const interval = setInterval(loadLeaders, 15 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);



  // API Data States
  const [youngest, setYoungest] = useState<PlayerStat[]>([]);
  const [oldest, setOldest] = useState<PlayerStat[]>([]);
  const [topClubs, setTopClubs] = useState<ClubCount[]>([]);
  const [topCities, setTopCities] = useState<CityCount[]>([]);
  const [confederations, setConfederations] = useState<Record<string, number>>({});
  const [countryAverages, setCountryAverages] = useState<CountryAverage[]>([]);

  // Filtering / Sorting Averages Table
  const [avgSearch, setAvgSearch] = useState("");
  const [avgSortField, setAvgSortField] = useState<"name" | "age" | "height" | "weight" | "players">("name");
  const [avgSortAsc, setAvgSortAsc] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/stats/player-stats");
        
        if (!res.ok) {
          throw new Error(`HTTP hatası! Durum kodu: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Sunucudan JSON yerine HTML sayfası döndü. Yeni eklenen API rotasının algılanması için lütfen terminaldeki geliştirme sunucunuzu (Next.js dev server) durdurup yeniden başlatın.");
        }

        const data = await res.json();
        
        if (data.success) {
          setYoungest(data.youngest || []);
          setOldest(data.oldest || []);
          setTopClubs(data.topClubs || []);
          setTopCities(data.topCities || []);
          setConfederations(data.confederations || {});
          setCountryAverages(data.countryAverages || []);
        } else {
          setError(data.error || "Oyuncu istatistikleri yüklenemedi.");
        }
      } catch (err: any) {
        setError(err.message || "İstatistikler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Helper to get flag URL
  const getFlagUrl = (teamId: string) => {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team || !team.code) return "";
    return `https://flagcdn.com/w40/${team.code.toLowerCase()}.png`;
  };

  const getTeamName = (teamId: string) => {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team) return teamId;
    return locale === "tr" ? team.nameTr : team.nameEn;
  };

  // Filter and sort country averages
  const processedAverages = useMemo(() => {
    let result = [...countryAverages];

    // Search filter
    if (avgSearch.trim() !== "") {
      const q = avgSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.teamNameTr.toLowerCase().includes(q) ||
          c.teamNameEn.toLowerCase().includes(q) ||
          c.teamId.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a.teamNameTr;
      let bVal: any = b.teamNameTr;

      if (avgSortField === "name") {
        aVal = locale === "tr" ? a.teamNameTr : a.teamNameEn;
        bVal = locale === "tr" ? b.teamNameTr : b.teamNameEn;
      } else if (avgSortField === "age") {
        aVal = a.avgAge;
        bVal = b.avgAge;
      } else if (avgSortField === "height") {
        aVal = a.avgHeight;
        bVal = b.avgHeight;
      } else if (avgSortField === "weight") {
        aVal = a.avgWeight;
        bVal = b.avgWeight;
      } else if (avgSortField === "players") {
        aVal = a.playerCount;
        bVal = b.playerCount;
      }

      if (aVal < bVal) return avgSortAsc ? -1 : 1;
      if (aVal > bVal) return avgSortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [countryAverages, avgSearch, avgSortField, avgSortAsc, locale]);

  const toggleSort = (field: "name" | "age" | "height" | "weight" | "players") => {
    if (avgSortField === field) {
      setAvgSortAsc((prev) => !prev);
    } else {
      setAvgSortField(field);
      setAvgSortAsc(true);
    }
  };

  // Static Historical Records data
  const historicalWins = [
    { countryTr: "Brezilya", countryEn: "Brazil", titles: 5, years: "1958, 1962, 1970, 1994, 2002", code: "br" },
    { countryTr: "Almanya", countryEn: "Germany", titles: 4, years: "1954, 1974, 1990, 2014", code: "de" },
    { countryTr: "İtalya", countryEn: "Italy", titles: 4, years: "1934, 1938, 1982, 2006", code: "it" },
    { countryTr: "Arjantin", countryEn: "Argentina", titles: 3, years: "1978, 1986, 2022", code: "ar" },
    { countryTr: "Fransa", countryEn: "France", titles: 2, years: "1998, 2018", code: "fr" },
    { countryTr: "Uruguay", countryEn: "Uruguay", titles: 2, years: "1930, 1950", code: "uy" },
    { countryTr: "İngiltere", countryEn: "England", titles: 1, years: "1966", code: "gb-eng" },
    { countryTr: "İspanya", countryEn: "Spain", titles: 1, years: "2010", code: "es" },
  ];

  const historicalFinals = [
    { countryTr: "Almanya", countryEn: "Germany", count: 8, wins: 4, runnersUp: 4 },
    { countryTr: "Brezilya", countryEn: "Brazil", count: 7, wins: 5, runnersUp: 2 },
    { countryTr: "İtalya", countryEn: "Italy", count: 6, wins: 4, runnersUp: 2 },
    { countryTr: "Arjantin", countryEn: "Argentina", count: 6, wins: 3, runnersUp: 3 },
    { countryTr: "Fransa", countryEn: "France", count: 4, wins: 2, runnersUp: 2 },
  ];

  const historicalScorers = [
    { name: "Lionel Messi", countryTr: "Arjantin", countryEn: "Argentina", goals: 18, matches: 27, code: "ar", emoji: "🇦🇷" },
    { name: "Miroslav Klose", countryTr: "Almanya", countryEn: "Germany", goals: 16, matches: 24, code: "de", emoji: "🇩🇪" },
    { name: "Kylian Mbappé", countryTr: "Fransa", countryEn: "France", goals: 16, matches: 15, code: "fr", emoji: "🇫🇷" },
    { name: "Ronaldo", countryTr: "Brezilya", countryEn: "Brazil", goals: 15, matches: 19, code: "br", emoji: "🇧🇷" },
    { name: "Gerd Müller", countryTr: "Almanya", countryEn: "Germany", goals: 14, matches: 13, code: "de", emoji: "🇩🇪" },
    { name: "Just Fontaine", countryTr: "Fransa", countryEn: "France", goals: 13, matches: 6, code: "fr", emoji: "🇫🇷" },
    { name: "Pelé", countryTr: "Brezilya", countryEn: "Brazil", goals: 12, matches: 14, code: "br", emoji: "🇧🇷" },
    { name: "Jürgen Klinsmann", countryTr: "Almanya", countryEn: "Germany", goals: 11, matches: 17, code: "de", emoji: "🇩🇪" },
    { name: "Sándor Kocsis", countryTr: "Macaristan", countryEn: "Hungary", goals: 11, matches: 5, code: "hu", emoji: "🇭🇺" },
    { name: "Grzegorz Lato", countryTr: "Polonya", countryEn: "Poland", goals: 10, matches: 20, code: "pl", emoji: "🇵🇱" },
    { name: "Thomas Müller", countryTr: "Almanya", countryEn: "Germany", goals: 10, matches: 19, code: "de", emoji: "🇩🇪" },
    { name: "Harry Kane", countryTr: "İngiltere", countryEn: "England", goals: 10, matches: 11, code: "gb-eng", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "Cristiano Ronaldo", countryTr: "Portekiz", countryEn: "Portugal", goals: 10, matches: 22, code: "pt", emoji: "🇵🇹" },
    { name: "Helmut Rahn", countryTr: "Almanya", countryEn: "Germany", goals: 10, matches: 10, code: "de", emoji: "🇩🇪" },
    { name: "Teófilo Cubillas", countryTr: "Peru", countryEn: "Peru", goals: 10, matches: 13, code: "pe", emoji: "🇵🇪" },
    { name: "Gabriel Batistuta", countryTr: "Arjantin", countryEn: "Argentina", goals: 10, matches: 12, code: "ar", emoji: "🇦🇷" },
    { name: "Gary Lineker", countryTr: "İngiltere", countryEn: "England", goals: 10, matches: 12, code: "gb-eng", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "Uwe Seeler", countryTr: "Almanya", countryEn: "Germany", goals: 9, matches: 21, code: "de", emoji: "🇩🇪" },
    { name: "Paolo Rossi", countryTr: "İtalya", countryEn: "Italy", goals: 9, matches: 14, code: "it", emoji: "🇮🇹" },
    { name: "Jairzinho", countryTr: "Brezilya", countryEn: "Brazil", goals: 9, matches: 16, code: "br", emoji: "🇧🇷" },
    { name: "Roberto Baggio", countryTr: "İtalya", countryEn: "Italy", goals: 9, matches: 16, code: "it", emoji: "🇮🇹" },
    { name: "Vavá", countryTr: "Brezilya", countryEn: "Brazil", goals: 9, matches: 10, code: "br", emoji: "🇧🇷" },
    { name: "Eusébio", countryTr: "Portekiz", countryEn: "Portugal", goals: 9, matches: 6, code: "pt", emoji: "🇵🇹" },
    { name: "David Villa", countryTr: "İspanya", countryEn: "Spain", goals: 9, matches: 12, code: "es", emoji: "🇪🇸" },
    { name: "Karl-Heinz Rummenigge", countryTr: "Almanya", countryEn: "Germany", goals: 9, matches: 19, code: "de", emoji: "🇩🇪" },
  ];

  // Dynamic integration of current tournament goals into all-time stats
  const updatedHistoricalScorers = useMemo(() => {
    return historicalScorers.map(s => {
      // Find matches in dbLeaders.scorers by player name and team code
      const currentScorer = dbLeaders.scorers.find(cs => {
        const dbNameClean = cs.player.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
        const histNameClean = s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
        
        // Exact or contains name match
        const nameMatch = dbNameClean === histNameClean || dbNameClean.includes(histNameClean) || histNameClean.includes(dbNameClean);
        
        // Match team code to prevent matching different players with similar names
        const teamInfo = getTeamById(cs.team.id);
        const teamMatch = teamInfo && teamInfo.code.toLowerCase() === s.code.toLowerCase();
        
        return nameMatch && teamMatch;
      });

      const extraGoals = currentScorer ? currentScorer.goals : 0;
      return {
        ...s,
        goals: s.goals + extraGoals
      };
    }).sort((a, b) => b.goals - a.goals);
  }, [dbLeaders.scorers]);

  const { topScorersText, maxGoals } = useMemo(() => {
    if (updatedHistoricalScorers.length === 0) {
      return { topScorersText: "Messi 🇦🇷", maxGoals: 18 };
    }
    const highest = updatedHistoricalScorers[0].goals;
    const leaders = updatedHistoricalScorers.filter(s => s.goals === highest);
    const text = leaders.map(s => `${s.name} ${s.emoji}`).join(" & ");
    return { topScorersText: text, maxGoals: highest };
  }, [updatedHistoricalScorers]);

  // Historical standings already include all-time data (2026 dahil)
  // Just sort by points, then goal difference, then goals scored
  const mergedHistoricalStandings = useMemo(() => {
    const sorted = [...HISTORICAL_STANDINGS].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      if (gdB !== gdA) {
        return gdB - gdA;
      }
      return b.goalsFor - a.goalsFor;
    });

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, []);

  const filteredHistoricalStandings = useMemo(() => {
    if (!historySearch.trim()) return mergedHistoricalStandings;
    const query = historySearch.toLowerCase();
    return mergedHistoricalStandings.filter(
      (s) =>
        s.nameEn.toLowerCase().includes(query) ||
        s.nameTr.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query)
    );
  }, [mergedHistoricalStandings, historySearch]);

  const displayedHistoricalStandings = showAllHistory
    ? filteredHistoricalStandings
    : filteredHistoricalStandings.slice(0, 15);

  return (
    <PageShell
      title={t("statsPage.title") || "İstatistikler"}
      subtitle={t("statsPage.subtitle") || "Turnuvadaki detaylı istatistikler ve rekorlar"}
    >
      {/* Navigation Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/5 pb-4 justify-center sm:justify-start">
        <button
          onClick={() => setActiveTab("squad")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "squad"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          {t("statsPage.tabSquad") || "Kadro Analizleri"}
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "live"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          {t("statsPage.tabLive") || "Canlı İstatistik"}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "history"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <History className="h-4 w-4" />
          {t("statsPage.tabHistory") || "Tarihsel Rekorlar"}
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">{t("predictions.loading") || "Yükleniyor..."}</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <>
          {/* TAB 1: SQUAD ANALYSIS */}
          {activeTab === "squad" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Country Squad Averages Section */}
              <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-400" />
                      {t("statsPage.countryAveragesTitle") || "Ülke Kadro Ortalamaları"}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">Takımları boy, yaş ve kilolarına göre sıralayabilirsiniz</p>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder={locale === "tr" ? "Ülke ara..." : "Search country..."}
                      value={avgSearch}
                      onChange={(e) => setAvgSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-white/5 text-xs font-semibold uppercase text-zinc-400 border-b border-white/10">
                      <tr>
                        <th onClick={() => toggleSort("players")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center w-24">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.colPlayersCount") || "Futbolcu"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("name")} className="cursor-pointer px-6 py-4 hover:text-white transition">
                          <span className="flex items-center gap-1">
                            {t("statsPage.colTeam") || "Takım"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("age")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.avgAge") || "Ort. Yaş"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("height")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.avgHeight") || "Ort. Boy"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("weight")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.avgWeight") || "Ort. Kilo"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {processedAverages.map((c) => (
                        <tr key={c.teamId} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-center font-bold text-zinc-400">
                            {c.playerCount}
                          </td>
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                            <img
                              src={getFlagUrl(c.teamId)}
                              alt={c.teamNameTr}
                              className="h-5 w-7 object-cover rounded shadow-sm border border-white/10"
                            />
                            <span>{locale === "tr" ? c.teamNameTr : c.teamNameEn}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-emerald-400">{c.avgAge} {t("teams.years") || "yaş"}</td>
                          <td className="px-6 py-4 text-center text-zinc-200">{c.avgHeight} cm</td>
                          <td className="px-6 py-4 text-center text-zinc-200">{c.avgWeight} kg</td>
                        </tr>
                      ))}
                      {processedAverages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                            {t("statsPage.emptyData") || "Veri bulunamadı."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Youngest / Oldest Grid */}
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* Youngest Players Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.youngestTitle") || "En Genç 20 Futbolcu"}
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20 max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-white/5 font-semibold text-zinc-400 sticky top-0 backdrop-blur border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3">{t("statsPage.colPlayer") || "Futbolcu"}</th>
                          <th className="px-4 py-3 text-center">{t("statsPage.colAge") || "Yaş"}</th>
                          <th className="px-4 py-3">{t("statsPage.colClub") || "Kulüp"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {youngest.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <Link href={`/futbolcular/${p.id}`} className="font-semibold text-white hover:text-emerald-400 transition-colors truncate max-w-[150px] block">
                                {p.player_name}
                              </Link>
                              <Link href={`/ulkeler/${p.team_id}`} className="text-zinc-500 flex items-center gap-1.5 mt-0.5 hover:text-emerald-400 transition-colors group">
                                <img src={getFlagUrl(p.team_id)} alt="" className="h-3 w-4.5 object-cover rounded-sm group-hover:ring-1 group-hover:ring-emerald-500/35 transition-all" />
                                <span className="group-hover:text-emerald-400 transition-colors">{getTeamName(p.team_id)}</span>
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-400">{p.age}</td>
                            <td className="px-4 py-3">
                              <div className="truncate max-w-[120px] text-zinc-200">{p.club}</div>
                              <div className="text-zinc-500 text-[10px]">{p.league}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Oldest Players Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.oldestTitle") || "En Yaşlı 20 Futbolcu"}
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20 max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-white/5 font-semibold text-zinc-400 sticky top-0 backdrop-blur border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3">{t("statsPage.colPlayer") || "Futbolcu"}</th>
                          <th className="px-4 py-3 text-center">{t("statsPage.colAge") || "Yaş"}</th>
                          <th className="px-4 py-3">{t("statsPage.colClub") || "Kulüp"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {oldest.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <Link href={`/futbolcular/${p.id}`} className="font-semibold text-white hover:text-emerald-400 transition-colors truncate max-w-[150px] block">
                                {p.player_name}
                              </Link>
                              <Link href={`/ulkeler/${p.team_id}`} className="text-zinc-500 flex items-center gap-1.5 mt-0.5 hover:text-emerald-400 transition-colors group">
                                <img src={getFlagUrl(p.team_id)} alt="" className="h-3 w-4.5 object-cover rounded-sm group-hover:ring-1 group-hover:ring-emerald-500/35 transition-all" />
                                <span className="group-hover:text-emerald-400 transition-colors">{getTeamName(p.team_id)}</span>
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-amber-400">{p.age}</td>
                            <td className="px-4 py-3">
                              <div className="truncate max-w-[120px] text-zinc-200">{p.club}</div>
                              <div className="text-zinc-500 text-[10px]">{p.league}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

              </div>

              {/* Clubs and Confederations Grid */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Top Clubs Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.topClubsTitle") || "En Çok Oyuncu Gönderen Kulüpler"}
                  </h2>
                  <div className="space-y-4">
                    {topClubs.map((clubInfo, idx) => {
                      const maxCount = topClubs[0]?.count || 1;
                      const percentage = (clubInfo.count / maxCount) * 100;
                      return (
                        <div key={clubInfo.club} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-zinc-200 flex items-center gap-2">
                              <span className="text-xs text-zinc-500 min-w-[20px]">#{idx + 1}</span>
                              {clubInfo.club}
                            </span>
                            <span className="font-bold text-emerald-400">{clubInfo.count} Oyuncu</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Top Birth Cities Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.topCitiesTitle") || "En Çok Oyuncu Doğan Şehirler"}
                  </h2>
                  <div className="space-y-4">
                    {topCities.map((cityInfo, idx) => {
                      const maxCount = topCities[0]?.count || 1;
                      const percentage = (cityInfo.count / maxCount) * 100;
                      return (
                        <div key={cityInfo.city} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-zinc-200 flex items-center gap-2">
                              <span className="text-xs text-zinc-500 min-w-[20px]">#{idx + 1}</span>
                              {cityInfo.city}
                            </span>
                            <span className="font-bold text-teal-400">{cityInfo.count} Oyuncu</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Confederations Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.confederationsTitle") || "Konfederasyon Dağılımı"}
                  </h2>
                  <div className="space-y-6">
                    {Object.entries(confederations)
                      .sort((a, b) => b[1] - a[1])
                      .map(([confName, count]) => {
                        const totalCount = Object.values(confederations).reduce((acc, curr) => acc + curr, 0) || 1;
                        const percentage = Math.round((count / totalCount) * 100);
                        return (
                          <div key={confName} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="font-bold text-zinc-100">{confName}</span>
                                <span className="text-xs text-zinc-500 ml-2">
                                  ({confName === "UEFA" ? "Avrupa" : 
                                    confName === "CONMEBOL" ? "Güney Amerika" : 
                                    confName === "CONCACAF" ? "Kuzey/Orta Amerika" : 
                                    confName === "AFC" ? "Asya" : 
                                    confName === "CAF" ? "Afrika" : "Okyanusya"})
                                </span>
                              </div>
                              <span className="font-semibold text-emerald-400">{count} Oyuncu ({percentage}%)</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>

              </div>

            </div>
          )}

          {/* TAB 2: LIVE STATS */}
          {activeTab === "live" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Dynamic Info Alert banner */}
              {simMatchId || realLiveMatch ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-red-400">
                  <Activity className="h-6 w-6 shrink-0 mt-0.5 animate-pulse text-red-500" />
                  <div>
                    <h4 className="font-bold text-base text-white">
                      {simMatchId 
                        ? (locale === "tr" ? "🔴 Canlı Maç Simülasyonu Aktif" : "🔴 Live Match Simulation Active")
                        : (locale === "tr" ? "🔴 Canlı Maç Devam Ediyor!" : "🔴 Live Match in Progress!")
                      }
                    </h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      {simMatchId 
                        ? (locale === "tr" 
                            ? "Hızlandırılmış (1 saniye = 1 dakika) simülasyon şu an çalışıyor. Maç durumunu ve canlı olayları anlık takip edebilirsiniz." 
                            : "Fast-forward simulation (1 second = 1 minute) is active. You can track match stats and live events in real-time.")
                        : (locale === "tr"
                            ? `${locale === "tr" ? getTeamById(realLiveMatch?.homeTeamId ?? "")?.nameTr : getTeamById(realLiveMatch?.homeTeamId ?? "")?.nameEn} - ${locale === "tr" ? getTeamById(realLiveMatch?.awayTeamId ?? "")?.nameTr : getTeamById(realLiveMatch?.awayTeamId ?? "")?.nameEn} maçı şu an canlı olarak oynanıyor. Anlık anlatım aşağıda listelenmektedir.`
                            : `The match between ${getTeamById(realLiveMatch?.homeTeamId ?? "")?.nameEn} and ${getTeamById(realLiveMatch?.awayTeamId ?? "")?.nameEn} is currently live. Live commentary is listed below.`)
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-amber-400">
                  <Activity className="h-6 w-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base text-white">
                      {locale === "tr" ? "Canlı Turnuva Skorları ve Anlatım" : "Live Tournament Scores & Commentary"}
                    </h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      {locale === "tr" 
                        ? "11 Haziran 2026 Dünya Şampiyonası açılış günü maçları aşağıda listelenmiştir. Canlı anlatımı test etmek için herhangi bir maçta 'Simüle Et' butonuna tıklayabilirsiniz." 
                        : "World Cup 2026 opening matches (June 11, 2026) are listed below. Click 'Simulate' on any match to test the live commentary ticker."}
                    </p>
                  </div>
                </div>
              )}

              {/* Today's Matches Board */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <span>{locale === "tr" ? "Günün Maçları (11 Haziran 2026)" : "Matches of the Day (June 11, 2026)"}</span>
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {displayMatches.map((m) => {
                    const homeTeam = getTeamById(m.homeTeamId);
                    const awayTeam = getTeamById(m.awayTeamId);
                    const homeName = locale === "tr" ? homeTeam?.nameTr : homeTeam?.nameEn;
                    const awayName = locale === "tr" ? awayTeam?.nameTr : awayTeam?.nameEn;
                    const isSimulated = simMatchId === m.id;
                    const isLive = m.isLive;
                    const isFinished = m.played;

                    return (
                      <div 
                        key={m.id} 
                        onClick={() => {
                          setSelectedMatchId(m.id);
                          setCommentaryClosed(false);
                        }}
                        className={`rounded-2xl border bg-[#0b1329]/30 p-5 backdrop-blur transition-all duration-300 cursor-pointer hover:border-emerald-500/30 ${
                          isLive 
                            ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                            : activeCommMatch?.id === m.id
                              ? "border-indigo-500/40 bg-indigo-950/10 shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                              : "border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                            {locale === "tr" ? `Grup ${m.group}` : `Group ${m.group}`}
                          </span>
                          <div className="flex items-center gap-2">
                            {isLive ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-red-500 animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                CANLI {m.elapsedMin}'
                              </span>
                            ) : isFinished ? (
                              <span className="text-xs font-bold text-zinc-500">
                                {locale === "tr" ? "MS" : "FT"}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-400/80">
                                {locale === "tr" ? `Bugün ${m.time}` : `Today ${m.time}`}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 py-2">
                          {/* Home Team */}
                          <Link 
                            href={`/ulkeler/${m.homeTeamId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 w-5/12 overflow-hidden hover:text-emerald-400 cursor-pointer transition-colors group"
                          >
                            <img 
                              src={getFlagUrl(m.homeTeamId)} 
                              alt="" 
                              className="h-6 w-9 object-cover rounded shadow border border-white/10 shrink-0 group-hover:ring-1 group-hover:ring-emerald-500/35 transition-all"
                            />
                            <span className="font-bold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">{homeName}</span>
                          </Link>

                          {/* Score / VS */}
                          <div className="flex items-center justify-center font-mono font-bold text-lg text-white w-2/12 bg-black/40 py-1 px-3 rounded-lg border border-white/5 shrink-0">
                            {isLive || isFinished ? (
                              <span>{m.homeScore} - {m.awayScore}</span>
                            ) : (
                              <span className="text-zinc-500 text-sm">VS</span>
                            )}
                          </div>

                          {/* Away Team */}
                          <Link 
                            href={`/ulkeler/${m.awayTeamId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-end gap-3 w-5/12 text-right overflow-hidden hover:text-emerald-400 cursor-pointer transition-colors group"
                          >
                            <span className="font-bold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">{awayName}</span>
                            <img 
                              src={getFlagUrl(m.awayTeamId)} 
                              alt="" 
                              className="h-6 w-9 object-cover rounded shadow border border-white/10 shrink-0 group-hover:ring-1 group-hover:ring-emerald-500/35 transition-all"
                            />
                          </Link>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">
                            {locale === "tr" ? "11 Haziran 2026" : "June 11, 2026"}
                          </span>
                          {!isSimulated && !simMatchId && !isLive && !isFinished && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startSimulation(m);
                                setCommentaryClosed(false);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                            >
                              <span>{locale === "tr" ? "Simüle Et" : "Simulate"}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                          {isSimulated && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseCommentary();
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition"
                            >
                              <span>{locale === "tr" ? "Simülasyonu Durdur" : "Stop Simulation"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulation Commentary & Pitch view */}
              {activeCommMatch && !commentaryClosed && (
                <div className="rounded-2xl border border-emerald-500/20 bg-[#081225]/40 p-6 backdrop-blur space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
                      <h3 className="text-lg font-bold text-white">
                        {locale === "tr" ? "Canlı Anlatım ve Önemli Anlar" : "Live Commentary & Key Moments"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {simRunning || (!simMatchId && activeCommMatch.isLive) ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                          {locale === "tr" ? "DEVAM EDİYOR" : "IN PROGRESS"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-bold text-zinc-400">
                          {activeCommMinute >= 94 
                            ? (locale === "tr" ? "BİTTİ" : "FINISHED")
                            : (locale === "tr" ? "DURAKLATILDI" : "PAUSED")
                          }
                        </span>
                      )}
                      {(simMatchId || selectedMatchId) && (
                        <button
                          onClick={handleCloseCommentary}
                          className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                        >
                          {locale === "tr" ? "Kapat" : "Close"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Surprise Reward chest */}
                  {activeReward && (
                    <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-yellow-950/40 p-5 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {/* Pulsing glow effect */}
                          <div className="absolute -inset-2 rounded-full bg-amber-500/30 blur-md animate-ping" />
                          <div className="relative text-4xl select-none filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                            🎁
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                            {locale === "tr" ? "SÜRPRİZ HEDİYE!" : "SURPRISE GIFT!"}
                          </p>
                          <h4 className="text-sm font-bold text-white">
                            {activeReward.type === "time" && (locale === "tr" ? "MinMat Ek Süre (+10sn)" : "MinMat Extra Time (+10s)")}
                            {activeReward.type === "life" && (locale === "tr" ? "MinMat Ek Can (+1 Can)" : "MinMat Extra Life (+1 Life)")}
                            {activeReward.type === "score" && (locale === "tr" ? "MinMat Başlangıç Skoru (+250 Puan)" : "MinMat Starting Score Boost (+250 Pts)")}
                          </h4>
                          <p className="text-xs text-amber-200/70 mt-0.5">
                            {locale === "tr" 
                              ? "Lobi ekranından aktifleştirerek kullanabilirsin." 
                              : "You can activate and use it from the lobby screen."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Countdown */}
                        <div className="flex flex-col items-center justify-center bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-lg font-mono text-center">
                          <span className="text-lg font-black text-amber-400">{activeReward.durationLeft}s</span>
                          <span className="text-[8px] text-amber-500 uppercase tracking-wider">{locale === "tr" ? "Kalan Süre" : "Time Left"}</span>
                        </div>
                        <button
                          onClick={() => claimReward(activeReward.minute)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                        >
                          {locale === "tr" ? "KAP!" : "CLAIM!"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FOMO Sitem Card */}
                  {activeCommMinute >= 94 && simMissedMinutes.length >= 2 && (
                    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-zinc-950/40 p-5 text-left flex items-start gap-4">
                      <span className="text-3xl shrink-0 select-none">😢</span>
                      <div>
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-wide">
                          {locale === "tr" ? "ÖDÜLLERİ KAÇIRDIN!" : "YOU MISSED THE REWARDS!"}
                        </h4>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          {t("fantasy.liveRewardFomoBanner")}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
                          <span>{locale === "tr" ? "Kaçırılan Ödül Sayısı:" : "Missed Rewards Count:"}</span>
                          <span className="text-amber-500 font-black">{simMissedMinutes.length}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Pitch/Score representation */}
                  <div className="rounded-xl bg-gradient-to-r from-emerald-950/20 to-teal-950/20 p-6 border border-emerald-500/10 text-center">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">
                      {locale === "tr" ? `${activeCommMinute}. Dakika` : `Minute ${activeCommMinute}`}
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      <span className="font-extrabold text-2xl text-white">
                        {locale === "tr" ? getTeamById(activeCommMatch.homeTeamId)?.nameTr : getTeamById(activeCommMatch.homeTeamId)?.nameEn}
                      </span>
                      <span className="font-mono font-extrabold text-4xl bg-black/60 px-5 py-3 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-lg min-w-[120px]">
                        {activeCommScore.home} - {activeCommScore.away}
                      </span>
                      <span className="font-extrabold text-2xl text-white">
                        {locale === "tr" ? getTeamById(activeCommMatch.awayTeamId)?.nameTr : getTeamById(activeCommMatch.awayTeamId)?.nameEn}
                      </span>
                    </div>
                  </div>

                  {/* Live status info */}
                  <div className="pt-2 text-center text-xs text-zinc-500">
                    {locale === "tr" 
                      ? "Canlı anlatım ve detaylar simülasyon dışındadır. Gerçek maç skorları ve gol krallığı güncel olarak yansıtılacaktır."
                      : "Live commentary and cards are disabled. Real match scores and top scorers are updated dynamically."}
                  </div>
                </div>
              )}

              {/* Leaderboard representation */}
              <div className="max-w-2xl mx-auto">
                
                {/* Live Scorers */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>⚽ {t("statsPage.liveScorers") || "Turnuva Gol Krallığı"}</span>
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{locale === "tr" ? "Aktif" : "Active"}</span>
                    <span className="text-sm text-zinc-400 ml-2">Toplam Gol: {totalGoals}</span>
                  </h3>
                  {dbLeaders.scorers.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                      {t("statsPage.liveNote") || "Maçlar başladığında goller burada güncellenecektir."}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {dbLeaders.scorers.map(({ player, team, goals }, idx) => {
                        const teamInfo = getTeamById(team.id);
                        return (
                          <div key={player.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-zinc-500 font-bold w-5">{idx + 1}.</span>
                              <img src={getFlagUrl(team.id)} alt="" className="h-4.5 w-7 object-cover rounded shadow border border-white/10" />
                              <span className="font-bold text-white text-sm">{player.name}</span>
                              <span className="text-xs text-zinc-400">({teamInfo ? (locale === "tr" ? teamInfo.nameTr : teamInfo.nameEn) : ""})</span>
                            </div>
                            <span className="font-extrabold text-emerald-400 text-sm">{goals} Gol</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: HISTORICAL RECORDS */}
          {activeTab === "history" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Overview block */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-600/10 to-transparent p-6 text-center">
                  <h4 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">En Çok Kupa Kazanan</h4>
                  <div className="mt-2 text-3xl font-extrabold text-white">Brezilya 🇧🇷</div>
                  <p className="mt-2 text-xs text-zinc-400">Toplamda 5 şampiyonluk</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-600/10 to-transparent p-6 text-center">
                  <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Tarihin En Golcüsü</h4>
                  <div className="mt-2 text-2xl font-extrabold text-white">{topScorersText}</div>
                  <p className="mt-2 text-xs text-zinc-400">
                    {locale === "tr" ? `${maxGoals} gol` : `${maxGoals} goals`}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/10 to-transparent p-6 text-center">
                  <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">En Çok Final Oynayan</h4>
                  <div className="mt-2 text-3xl font-extrabold text-white">Almanya 🇩🇪</div>
                  <p className="mt-2 text-xs text-zinc-400">8 kez final mücadelesi</p>
                </div>
              </div>

              {/* All-time Standings Table */}
              <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-400" />
                      {locale === "tr" ? "Tüm Zamanlar Dünya Kupası Puan Durumu" : "All-Time World Cup Standings"}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      {locale === "tr"
                        ? "Dünya Kupası tarihindeki tüm maç sonuçlarına göre puan durumu. Güncel turnuvadaki maçlar ve puanlar anlık olarak eklenmektedir."
                        : "Overall standings based on all matches in World Cup history. Matches and points from the current tournament are merged dynamically."}
                    </p>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder={locale === "tr" ? "Ülke ara..." : "Search country..."}
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-white/5 text-xs font-semibold uppercase text-zinc-400 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-4 text-center w-12">{locale === "tr" ? "Sıra" : "Rank"}</th>
                        <th className="px-4 py-4">{locale === "tr" ? "Takım" : "Team"}</th>
                        <th className="px-4 py-4 text-center w-20">{locale === "tr" ? "Katılım" : "Part."}</th>
                        <th className="px-4 py-4 text-center w-16">O</th>
                        <th className="px-4 py-4 text-center w-16">G</th>
                        <th className="px-4 py-4 text-center w-16">B</th>
                        <th className="px-4 py-4 text-center w-16">M</th>
                        <th className="px-4 py-4 text-center w-16">A</th>
                        <th className="px-4 py-4 text-center w-16">Y</th>
                        <th className="px-4 py-4 text-center w-16">Av.</th>
                        <th className="px-4 py-4 text-center w-20 font-bold text-emerald-400">P</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {displayedHistoricalStandings.map((s) => {
                        const is2026Participant = s.isParticipating;
                        const flagUrl = `https://flagcdn.com/w40/${s.code.toLowerCase()}.png`;

                        return (
                          <tr
                            key={s.id}
                            className={`transition-colors hover:bg-white/5 ${
                              is2026Participant ? "bg-emerald-500/[0.03] border-l-2 border-l-emerald-500" : ""
                            }`}
                          >
                            <td className="px-4 py-3.5 text-center font-mono font-bold text-zinc-400">
                              {s.rank}
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-white flex items-center gap-3">
                              <img
                                src={flagUrl}
                                alt={s.nameTr}
                                className="h-5 w-7 object-cover rounded shadow-sm border border-white/10 shrink-0"
                              />
                              <span className={is2026Participant ? "text-emerald-400 font-extrabold" : ""}>
                                {locale === "tr" ? s.nameTr : s.nameEn}
                              </span>
                              {is2026Participant && (
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0 select-none">
                                  2026
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center text-zinc-300 font-semibold">{s.participations}</td>
                            <td className="px-4 py-3.5 text-center text-zinc-300">{s.played}</td>
                            <td className="px-4 py-3.5 text-center text-emerald-500/90 font-medium">{s.won}</td>
                            <td className="px-4 py-3.5 text-center text-zinc-400">{s.drawn}</td>
                            <td className="px-4 py-3.5 text-center text-red-500/80">{s.lost}</td>
                            <td className="px-4 py-3.5 text-center text-zinc-300">{s.goalsFor}</td>
                            <td className="px-4 py-3.5 text-center text-zinc-300">{s.goalsAgainst}</td>
                            <td className="px-4 py-3.5 text-center font-mono text-zinc-400">
                              {(s.goalsFor - s.goalsAgainst) > 0 ? `+${s.goalsFor - s.goalsAgainst}` : s.goalsFor - s.goalsAgainst}
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono font-black text-emerald-400 bg-emerald-500/[0.01]">
                              {s.points}
                            </td>
                          </tr>
                        );
                      })}
                      {displayedHistoricalStandings.length === 0 && (
                        <tr>
                          <td colSpan={11} className="px-6 py-8 text-center text-zinc-500">
                            {locale === "tr" ? "Aranan takım bulunamadı." : "No matching team found."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredHistoricalStandings.length > 15 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="rounded-xl bg-white/5 border border-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/10 hover:border-emerald-500/30 transition-all uppercase tracking-wider"
                    >
                      {showAllHistory
                        ? (locale === "tr" ? "Daha Az Göster" : "Show Less")
                        : (locale === "tr" ? `Daha Fazla Göster (+${filteredHistoricalStandings.length - 15} takım)` : `Show More (+${filteredHistoricalStandings.length - 15} teams)`)}
                    </button>
                  </div>
                )}
              </section>

              {/* Detail Lists Grid */}
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* Titles List */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.historyWins") || "Dünya Kupası Şampiyonluk Sayıları"}
                  </h3>
                  <div className="space-y-4">
                    {historicalWins.map((w, idx) => (
                      <div key={w.countryEn} className="flex items-center justify-between rounded-xl bg-black/20 p-3 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 font-bold">#{idx + 1}</span>
                          <img 
                            src={`https://flagcdn.com/w40/${w.code}.png`} 
                            alt="" 
                            className="h-4.5 w-7 object-cover rounded shadow-sm border border-white/10" 
                          />
                          <div>
                            <div className="font-bold text-white">{locale === "tr" ? w.countryTr : w.countryEn}</div>
                            <div className="text-[10px] text-zinc-500">{w.years}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-extrabold text-emerald-400">{w.titles}</span>
                          <span className="text-xs text-zinc-500">Kupa</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* All-time Scorers List */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.historyScorers") || "Dünya Kupası Tarihinin En Golcüleri"}
                  </h3>
                  <div className="space-y-4 border border-white/5 rounded-xl bg-black/20 divide-y divide-white/5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                    {updatedHistoricalScorers.map((s, idx) => {
                      const rank = updatedHistoricalScorers.findIndex(x => x.goals === s.goals) + 1;
                      return (
                        <div key={s.name} className="flex items-center justify-between p-3.5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500 font-bold w-5">#{rank}</span>
                            <img 
                              src={`https://flagcdn.com/w40/${s.code}.png`} 
                              alt="" 
                              className="h-4.5 w-7 object-cover rounded shadow-sm border border-white/10" 
                            />
                            <div>
                              <div className="font-bold text-white">{s.name}</div>
                              <div className="text-[10px] text-zinc-500">{locale === "tr" ? s.countryTr : s.countryEn} — {s.matches} Maç</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg font-extrabold text-amber-400">{s.goals}</span>
                            <span className="text-xs text-zinc-500">Gol</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Finals Played list */}
                <section className="md:col-span-2 rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.historyFinals") || "En Çok Final Oynayan Ülkeler"}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {historicalFinals.map((f, idx) => (
                      <div key={f.countryEn} className="rounded-xl bg-black/30 p-4 border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-white">{locale === "tr" ? f.countryTr : f.countryEn}</span>
                          <span className="text-xs text-zinc-500">#{idx + 1}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white/5 rounded p-2">
                            <div className="text-xs text-zinc-500">Final</div>
                            <div className="text-lg font-bold text-white">{f.count}</div>
                          </div>
                          <div className="bg-emerald-500/10 rounded p-2 text-emerald-400">
                            <div className="text-xs text-zinc-500">Kazandı</div>
                            <div className="text-lg font-bold">{f.wins}</div>
                          </div>
                          <div className="bg-red-500/10 rounded p-2 text-red-400">
                            <div className="text-xs text-zinc-500">Kaybetti</div>
                            <div className="text-lg font-bold">{f.runnersUp}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
