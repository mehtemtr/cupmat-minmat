"use client";

import { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { TEAMS, getTeamById } from "@/data/teams";
import { generateGroupFixtures } from "@/lib/fixtures";
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

interface SimEvent {
  minute: number;
  type: "start" | "half" | "goal" | "card" | "sub" | "end" | "commentary";
  textTr: string;
  textEn: string;
  scoreAfter?: { home: number; away: number };
}

function generateSimulation(match: any, homePlayers: any[], awayPlayers: any[]): SimEvent[] {
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = hashString(match.id);
  
  const rand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const events: SimEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  const getDeterministicPlayer = (isHome: boolean, s: number) => {
    const list = isHome ? homePlayers : awayPlayers;
    if (!list || list.length === 0) return isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu";
    const idx = Math.floor(rand(s) * list.length);
    return list[idx].name;
  };

  events.push({
    minute: 1,
    type: "start",
    textTr: "🏁 Hakem düdüğünü çaldı ve maç başladı!",
    textEn: "🏁 The referee blows the whistle and the match begins!",
    scoreAfter: { home: 0, away: 0 }
  });

  const g1Min = Math.floor(rand(seed + 1) * 25) + 10;
  const g1Home = rand(seed + 2) > 0.5;
  if (g1Home) homeScore++; else awayScore++;
  const scorer1 = getDeterministicPlayer(g1Home, seed + 3);
  events.push({
    minute: g1Min,
    type: "goal",
    textTr: `⚽ GOL! ${g1Home ? "Ev sahibi" : "Deplasman"} ekip golü buluyor! Golü atan oyuncu: ${scorer1}!`,
    textEn: `⚽ GOAL! The ${g1Home ? "home" : "away"} side scores! Goal by ${scorer1}!`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  const c1Min = Math.floor(rand(seed + 4) * 20) + 20;
  const c1Home = rand(seed + 5) > 0.5;
  const playerCard1 = getDeterministicPlayer(c1Home, seed + 6);
  events.push({
    minute: c1Min,
    type: "card",
    textTr: `🟨 Sarı Kart: ${playerCard1} rakibine yaptığı sert müdahale sonrası sarı kart görüyor.`,
    textEn: `🟨 Yellow Card: ${playerCard1} receives a yellow card for a hard tackle.`,
  });

  events.push({
    minute: 45,
    type: "half",
    textTr: `⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: ${homeScore} - ${awayScore}`,
    textEn: `⏸️ Halftime. Teams head to the dressing room. Score: ${homeScore} - ${awayScore}`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  events.push({
    minute: 46,
    type: "start",
    textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
    textEn: "🏁 Second half kicked off. Good luck to both teams!",
  });

  const subMin = Math.floor(rand(seed + 7) * 15) + 50;
  const subHome = rand(seed + 8) > 0.5;
  const subOut = getDeterministicPlayer(subHome, seed + 9);
  const subIn = getDeterministicPlayer(subHome, seed + 10);
  if (subOut !== subIn) {
    events.push({
      minute: subMin,
      type: "sub",
      textTr: `🔄 Oyuncu Değişikliği: ${subHome ? "Ev sahibi" : "Deplasman"} takımda oyuncu değişikliği. ${subOut} kenara gelirken ${subIn} oyuna dahil oluyor.`,
      textEn: `🔄 Substitution: For the ${subHome ? "home" : "away"} team, ${subIn} comes on to replace ${subOut}.`,
    });
  }

  const g2Min = Math.floor(rand(seed + 11) * 20) + 65;
  const g2Home = rand(seed + 12) > 0.5;
  if (g2Home) homeScore++; else awayScore++;
  const scorer2 = getDeterministicPlayer(g2Home, seed + 13);
  events.push({
    minute: g2Min,
    type: "goal",
    textTr: `⚽ GOL! Maçta heyecan dorukta! ${scorer2} topu ağlara gönderiyor!`,
    textEn: `⚽ GOAL! The excitement is high! ${scorer2} sends the ball into the back of the net!`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  const c2Min = Math.floor(rand(seed + 14) * 19) + 70;
  const c2Home = rand(seed + 15) > 0.5;
  const playerCard2 = getDeterministicPlayer(c2Home, seed + 16);
  events.push({
    minute: c2Min,
    type: "card",
    textTr: `🟨 Sarı Kart: ${playerCard2} hakeme yaptığı itirazlar sonrası sarı kartla cezalandırılıyor.`,
    textEn: `🟨 Yellow Card: ${playerCard2} is booked for protesting.`,
  });

  events.push({
    minute: 90,
    type: "commentary",
    textTr: "⏱️ Maçın sonuna en az 4 uzatma dakikası eklendi.",
    textEn: "⏱️ A minimum of 4 minutes of added time announced.",
  });

  events.push({
    minute: 94,
    type: "end",
    textTr: `🔚 Son düdük çaldı! Maç bitti. Skor: ${homeScore} - ${awayScore}`,
    textEn: `🔚 Full-time! The match is over. Final Score: ${homeScore} - ${awayScore}`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  return events.sort((a, b) => a.minute - b.minute);
}

export default function StatisticsPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"squad" | "live" | "history">("squad");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live simulation states
  const [simMatchId, setSimMatchId] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simMinute, setSimMinute] = useState(1);
  const [simScore, setSimScore] = useState<{ home: number; away: number }>({ home: 0, away: 0 });
  const [simEvents, setSimEvents] = useState<any[]>([]);
  const [simAllEvents, setSimAllEvents] = useState<any[]>([]);

  // Real clock state
  const [currentRealTime, setCurrentRealTime] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentRealTime(Date.now());
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Get today's matches (June 11, 2026)
  const [localMatches, setLocalMatches] = useState<any[]>(() => {
    return generateGroupFixtures().filter(m => m.date === "2026-06-11");
  });

  const displayMatches = useMemo(() => {
    return localMatches.map(m => {
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

      // 2. Real clock calculations
      const [hourStr, minStr] = (m.time || "12:00").split(":");
      const [yrStr, moStr, dyStr] = m.date.split("-");
      const kickoffTime = new Date(Date.UTC(
        parseInt(yrStr, 10),
        parseInt(moStr, 10) - 1,
        parseInt(dyStr, 10),
        parseInt(hourStr, 10),
        parseInt(minStr, 10),
        0
      )).getTime();

      const isRealLive = currentRealTime >= kickoffTime && currentRealTime < kickoffTime + (120 * 60 * 1000);
      const isRealFinished = currentRealTime >= kickoffTime + (120 * 60 * 1000);

      if (isRealLive || isRealFinished) {
        const homeTeam = getTeamById(m.homeTeamId);
        const awayTeam = getTeamById(m.awayTeamId);
        const homePlayers = homeTeam?.players || [];
        const awayPlayers = awayTeam?.players || [];
        const eventsList = generateSimulation(m, homePlayers, awayPlayers);
        
        const elapsedMin = isRealFinished 
          ? 94 
          : Math.min(94, Math.max(1, Math.floor((currentRealTime - kickoffTime) / 60000)));

        const activeEvents = eventsList.filter(e => e.minute <= elapsedMin);
        const scoreEvents = activeEvents.filter(e => e.scoreAfter);
        const latestScore = scoreEvents.length > 0 
          ? scoreEvents[scoreEvents.length - 1].scoreAfter 
          : { home: 0, away: 0 };

        return {
          ...m,
          homeScore: latestScore?.home ?? 0,
          awayScore: latestScore?.away ?? 0,
          played: isRealFinished,
          isLive: isRealLive,
          elapsedMin
        };
      }

      return m;
    });
  }, [localMatches, simMatchId, simScore, simMinute, currentRealTime]);

  const realLiveMatch = useMemo(() => {
    if (simMatchId) return null;
    return displayMatches.find(m => m.isLive);
  }, [displayMatches, simMatchId]);

  const realLiveEvents = useMemo(() => {
    if (!realLiveMatch) return [];
    const homeTeam = getTeamById(realLiveMatch.homeTeamId);
    const awayTeam = getTeamById(realLiveMatch.awayTeamId);
    const homePlayers = homeTeam?.players || [];
    const awayPlayers = awayTeam?.players || [];
    const eventsList = generateSimulation(realLiveMatch, homePlayers, awayPlayers);
    return eventsList.filter(e => e.minute <= (realLiveMatch.elapsedMin || 1));
  }, [realLiveMatch]);

  // Unified Commentary selectors
  const activeCommMatch = useMemo(() => {
    if (simMatchId) {
      return displayMatches.find(m => m.id === simMatchId) || null;
    }
    return realLiveMatch || null;
  }, [simMatchId, displayMatches, realLiveMatch]);

  const activeCommEvents = useMemo(() => {
    if (simMatchId) return simEvents;
    return realLiveEvents;
  }, [simMatchId, simEvents, realLiveEvents]);

  const activeCommScore = useMemo(() => {
    if (simMatchId) return simScore;
    return { home: activeCommMatch?.homeScore ?? 0, away: activeCommMatch?.awayScore ?? 0 };
  }, [simMatchId, simScore, activeCommMatch]);

  const activeCommMinute = useMemo(() => {
    if (simMatchId) return simMinute;
    return activeCommMatch?.elapsedMin ?? 1;
  }, [simMatchId, simMinute, activeCommMatch]);

  const startSimulation = (match: any) => {
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
  };

  const stopSimulation = () => {
    setSimRunning(false);
    setSimMatchId(null);
    setSimMinute(1);
    setSimScore({ home: 0, away: 0 });
    setSimEvents([]);
    setSimAllEvents([]);
  };

  // Simulation clock logic
  useEffect(() => {
    if (!simRunning || !simMatchId) return;

    const intervalId = setInterval(() => {
      setSimMinute((prevMin) => {
        const nextMin = prevMin + 1;
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
    { name: "Miroslav Klose", countryTr: "Almanya", countryEn: "Germany", goals: 16, matches: 24, code: "de" },
    { name: "Ronaldo", countryTr: "Brezilya", countryEn: "Brazil", goals: 15, matches: 19, code: "br" },
    { name: "Gerd Müller", countryTr: "Almanya", countryEn: "Germany", goals: 14, matches: 13, code: "de" },
    { name: "Just Fontaine", countryTr: "Fransa", countryEn: "France", goals: 13, matches: 6, code: "fr" },
    { name: "Lionel Messi", countryTr: "Arjantin", countryEn: "Argentina", goals: 13, matches: 26, code: "ar" },
    { name: "Pelé", countryTr: "Brezilya", countryEn: "Brazil", goals: 12, matches: 14, code: "br" },
  ];

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
                              <div className="font-semibold text-white truncate max-w-[150px]">{p.player_name}</div>
                              <div className="text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                <img src={getFlagUrl(p.team_id)} alt="" className="h-3 w-4.5 object-cover rounded-sm" />
                                <span>{getTeamName(p.team_id)}</span>
                              </div>
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
                              <div className="font-semibold text-white truncate max-w-[150px]">{p.player_name}</div>
                              <div className="text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                <img src={getFlagUrl(p.team_id)} alt="" className="h-3 w-4.5 object-cover rounded-sm" />
                                <span>{getTeamName(p.team_id)}</span>
                              </div>
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
                        className={`rounded-2xl border bg-[#0b1329]/30 p-5 backdrop-blur transition-all duration-300 ${
                          isLive 
                            ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
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
                          <div className="flex items-center gap-3 w-5/12 overflow-hidden">
                            <img 
                              src={getFlagUrl(m.homeTeamId)} 
                              alt="" 
                              className="h-6 w-9 object-cover rounded shadow border border-white/10 shrink-0"
                            />
                            <span className="font-bold text-white text-sm truncate">{homeName}</span>
                          </div>

                          {/* Score / VS */}
                          <div className="flex items-center justify-center font-mono font-bold text-lg text-white w-2/12 bg-black/40 py-1 px-3 rounded-lg border border-white/5 shrink-0">
                            {isLive || isFinished ? (
                              <span>{m.homeScore} - {m.awayScore}</span>
                            ) : (
                              <span className="text-zinc-500 text-sm">VS</span>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center justify-end gap-3 w-5/12 text-right overflow-hidden">
                            <span className="font-bold text-white text-sm truncate">{awayName}</span>
                            <img 
                              src={getFlagUrl(m.awayTeamId)} 
                              alt="" 
                              className="h-6 w-9 object-cover rounded shadow border border-white/10 shrink-0"
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">
                            {locale === "tr" ? "11 Haziran 2026" : "June 11, 2026"}
                          </span>
                          {!isSimulated && !simMatchId && (
                            <button
                              onClick={() => startSimulation(m)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                            >
                              <span>{locale === "tr" ? "Simüle Et" : "Simulate"}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                          {isSimulated && (
                            <button
                              onClick={stopSimulation}
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
              {activeCommMatch && (
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
                      {simMatchId && (
                        <button
                          onClick={stopSimulation}
                          className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                        >
                          {locale === "tr" ? "Kapat" : "Close"}
                        </button>
                      )}
                    </div>
                  </div>

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

                  {/* Timeline events scroll box */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeCommEvents.length === 0 ? (
                      <p className="text-zinc-500 text-center text-sm py-8">
                        {locale === "tr" ? "Maç başlasın diye bekleniyor..." : "Waiting for match kick-off..."}
                      </p>
                    ) : (
                      [...activeCommEvents].reverse().map((ev, idx) => {
                        const isGoal = ev.type === "goal";
                        const isCard = ev.type === "card";
                        const isStartOrEnd = ev.type === "start" || ev.type === "end" || ev.type === "half";

                        return (
                          <div 
                            key={idx} 
                            className={`flex gap-4 p-3.5 rounded-xl border transition-all duration-300 animate-slideUp ${
                              isGoal 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                : isCard
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                                  : isStartOrEnd
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                                    : "bg-white/[0.02] border-white/5 text-zinc-300"
                            }`}
                          >
                            <div className="font-mono font-extrabold text-sm shrink-0 bg-black/30 w-10 h-7 flex items-center justify-center rounded border border-white/5">
                              {ev.minute}'
                            </div>
                            <div className="text-sm font-medium leading-relaxed">
                              {locale === "tr" ? ev.textTr : ev.textEn}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Grid representation */}
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* Live Scorers Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>⚽ {t("statsPage.liveScorers") || "Turnuva Gol Krallığı"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Maçlar başladığında goller burada güncellenecektir."}
                  </div>
                </div>

                {/* Live Assists Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>👟 {t("statsPage.liveAssists") || "Turnuva Asist Krallığı"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Asistler burada güncellenecektir."}
                  </div>
                </div>

                {/* Live Cards Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>🟨🟥 {t("statsPage.liveCards") || "Kart Raporları"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Sarı ve kırmızı kart istatistikleri burada listelenecektir."}
                  </div>
                </div>

                {/* Live Own Goals Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>🤦‍♂️ {t("statsPage.liveOwnGoals") || "Kendi Kalesine Goller"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Kendi kalesine atılan goller burada listelenecektir."}
                  </div>
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
                  <div className="mt-2 text-3xl font-extrabold text-white">M. Klose 🇩🇪</div>
                  <p className="mt-2 text-xs text-zinc-400">24 maçta 16 gol</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/10 to-transparent p-6 text-center">
                  <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">En Çok Final Oynayan</h4>
                  <div className="mt-2 text-3xl font-extrabold text-white">Almanya 🇩🇪</div>
                  <p className="mt-2 text-xs text-zinc-400">8 kez final mücadelesi</p>
                </div>
              </div>

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
                  <div className="space-y-4 border border-white/5 rounded-xl bg-black/20 divide-y divide-white/5">
                    {historicalScorers.map((s, idx) => (
                      <div key={s.name} className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 font-bold">#{idx + 1}</span>
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
                    ))}
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
