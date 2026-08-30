"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Activity, MapPin, Trophy, Award, BarChart3, ChevronRight, ChevronDown, X, RefreshCw } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";
import { createClient } from "@supabase/supabase-js";

// Supabase client initialization (Client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ==========================================
// CONSTANTS
// ==========================================
const CONTINENTS = [
  { id: "all", name: "Tümünü Gör" },
  { id: "europe", name: "Avrupa" },
  { id: "asia", name: "Asya" },
  { id: "america", name: "Amerika" },
  { id: "africa", name: "Afrika" },
];

const TOURNAMENTS = {
  "europe": [
    { id: 2, name: "Şampiyonlar Ligi" },
    { id: 3, name: "Avrupa Ligi" },
    { id: 848, name: "Konferans Ligi" },
    { id: 5, name: "Milli Maçlar (Nations League)" },
  ],
  "asia": [
    { id: 17, name: "AFC Şampiyonlar Ligi" },
  ],
  "america": [
    { id: 13, name: "Copa Libertadores" },
    { id: 11, name: "Copa Sudamericana" },
    { id: 16, name: "CONCACAF Champions" },
    { id: 34, name: "Milli Elemeler" },
  ],
  "africa": [
    { id: 12, name: "CAF Şampiyonlar Ligi" },
    { id: 32, name: "Milli Elemeler (AFCON)" },
  ]
};

type MatchType = {
  id: string;
  api_id: number;
  tournament_id: string;
  season: number;
  round: string;
  date: string;
  dateStr: string;
  time: string;
  status: string;
  isSecondLeg?: boolean;
  isTieFinished?: boolean;
  team1: { 
    name: string; 
    countryCode: string; 
    score: number | null; 
    isWinner: boolean; 
    firstLegScore?: number;
    isTieWinner?: boolean;
  };
  team2: { 
    name: string; 
    countryCode: string; 
    score: number | null; 
    isWinner: boolean; 
    firstLegScore?: number;
    isTieWinner?: boolean;
  };
  aggregateScore?: { team1: number; team2: number };
  tournament_api_id: number;
  tournament_name: string;
  region: string;
};

export default function CupMatMatchCenter() {
  const { t } = useTranslation();
  
  // States
  const [mainView, setMainView] = useState<"matches" | "stats" | "standings" | "sm_standings">("matches");
  const [activeContinent, setActiveContinent] = useState<string>("europe");
  const [activeTournament, setActiveTournament] = useState<number>(2);
  const [expandedRounds, setExpandedRounds] = useState<Record<string, boolean>>({});
  const [selectedMatch, setSelectedMatch] = useState<MatchType | null>(null);
  
  // Real Data States
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real matches from Supabase
  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      // Join matches with tournaments to get region and api_id
      const { data, error } = await supabase
        .from('cupmat_matches')
        .select(`
          *,
          cupmat_tournaments!inner(api_id, region, name)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching matches:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const rawMatches: MatchType[] = data.map((item: any) => {
          const matchDate = new Date(item.date);
          const dateStr = matchDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

          let cleanRound = item.round || 'Normal Sezon';
          cleanRound = cleanRound.replace(/[^0-9\. ]*n Eleme/g, "Ön Eleme").replace(/\s+/g, " ");

          const homeCountry = (!item.home_team_country_code || item.home_team_country_code === "TBD" || item.home_team_country_code === "UNK") ? "" : item.home_team_country_code;
          const awayCountry = (!item.away_team_country_code || item.away_team_country_code === "TBD" || item.away_team_country_code === "UNK") ? "" : item.away_team_country_code;

          return {
            id: item.id,
            api_id: item.api_id,
            tournament_id: item.tournament_id,
            tournament_api_id: item.cupmat_tournaments.api_id,
            tournament_name: item.cupmat_tournaments.name,
            region: item.cupmat_tournaments.region || 'world',
            season: item.season,
            round: cleanRound,
            date: item.date,
            dateStr: dateStr,
            time: timeStr,
            status: item.status,
            team1: { 
              name: item.home_team_name, 
              countryCode: homeCountry, 
              score: item.home_score, 
              isWinner: item.home_is_winner,
              firstLegScore: item.first_leg_home_score
            },
            team2: { 
              name: item.away_team_name, 
              countryCode: awayCountry, 
              score: item.away_score, 
              isWinner: item.away_is_winner,
              firstLegScore: item.first_leg_away_score
            },
            aggregateScore: item.aggregate_home_score !== null && item.aggregate_away_score !== null ? {
              team1: item.aggregate_home_score,
              team2: item.aggregate_away_score
            } : undefined
          };
        });

        // Pair 1st and 2nd leg matches to calculate aggregate scores and determine who qualified
        const formattedMatches: MatchType[] = rawMatches.map((m2) => {
          // Find if there is an earlier 1st leg match with reversed home/away
          const m1 = rawMatches.find((m) => 
            m.tournament_id === m2.tournament_id &&
            m.round === m2.round &&
            m.team1.name === m2.team2.name &&
            m.team2.name === m2.team1.name &&
            new Date(m.date).getTime() < new Date(m2.date).getTime()
          );

          // Find if there is a later 2nd leg match with reversed home/away
          const futureLeg = rawMatches.find((m) =>
            m.tournament_id === m2.tournament_id &&
            m.round === m2.round &&
            m.team1.name === m2.team2.name &&
            m.team2.name === m2.team1.name &&
            new Date(m.date).getTime() > new Date(m2.date).getTime()
          );

          const isTwoLeggedTie = !!m1 || !!futureLeg;
          const isSecondLeg = !!m1;
          const firstLegTeam1Score = m1 ? m1.team2.score : m2.team1.firstLegScore;
          const firstLegTeam2Score = m1 ? m1.team1.score : m2.team2.firstLegScore;

          let aggScore = m2.aggregateScore;
          if (m1 && m1.team1.score !== null && m1.team2.score !== null && m2.team1.score !== null && m2.team2.score !== null) {
            aggScore = {
              team1: Number(m2.team1.score) + Number(m1.team2.score),
              team2: Number(m2.team2.score) + Number(m1.team1.score)
            };
          }

          const isMatchFinished = ["FT", "AET", "PEN"].includes(m2.status);
          let isTieFinished = false;
          let team1TieWinner = false;
          let team2TieWinner = false;

          // Only determine tie qualification on the 2nd leg when finished, OR on single-match knockout finals
          if (isSecondLeg && isMatchFinished && aggScore) {
            isTieFinished = true;
            if (aggScore.team1 > aggScore.team2) {
              team1TieWinner = true;
            } else if (aggScore.team2 > aggScore.team1) {
              team2TieWinner = true;
            } else {
              // Tie in aggregate score: check match penalty/winner flags
              if (m2.team1.isWinner) team1TieWinner = true;
              else if (m2.team2.isWinner) team2TieWinner = true;
              else if (m2.team1.score !== null && m2.team2.score !== null) {
                if (m2.team1.score > m2.team2.score) team1TieWinner = true;
                else if (m2.team2.score > m2.team1.score) team2TieWinner = true;
              }
            }
          } else if (!isTwoLeggedTie && isMatchFinished && (m2.round.toLowerCase().includes("final") || m2.round.toLowerCase().includes("super cup"))) {
            // Single-match knockout final
            if (m2.team1.isWinner) {
              isTieFinished = true;
              team1TieWinner = true;
            } else if (m2.team2.isWinner) {
              isTieFinished = true;
              team2TieWinner = true;
            }
          }

          return {
            ...m2,
            isSecondLeg,
            isTieFinished,
            team1: {
              ...m2.team1,
              firstLegScore: firstLegTeam1Score ?? undefined,
              isTieWinner: team1TieWinner
            },
            team2: {
              ...m2.team2,
              firstLegScore: firstLegTeam2Score ?? undefined,
              isTieWinner: team2TieWinner
            },
            aggregateScore: aggScore
          };
        });
        
        setMatches(formattedMatches);
        
        // Auto-expand all rounds by default so user sees every round & first leg matches immediately
        const allRoundsMap: Record<string, boolean> = {};
        formattedMatches.forEach(m => {
          allRoundsMap[m.round] = true;
          allRoundsMap[`${m.tournament_name} - ${m.round}`] = true;
        });
        setExpandedRounds(allRoundsMap);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Kıta değişince alt turnuvaları güncelle
  useEffect(() => {
    if (activeContinent !== "all") {
      const tournaments = TOURNAMENTS[activeContinent as keyof typeof TOURNAMENTS];
      if (tournaments && tournaments.length > 0) {
        setActiveTournament(tournaments[0].id);
      }
    }
  }, [activeContinent]);

  const toggleRound = (round: string) => {
    setExpandedRounds(prev => ({ ...prev, [round]: !prev[round] }));
  };

  // Filtrelenmiş maçlar
  const filteredMatches = matches.filter(m => {
    if (activeContinent === "all") return true;
    return m.tournament_api_id === activeTournament;
  });

  // Maçları Turlara göre grupla
  const groupedByRound = filteredMatches.reduce((acc, match) => {
    const roundKey = activeContinent === "all" ? `${match.tournament_name} - ${match.round}` : match.round;
    if (!acc[roundKey]) acc[roundKey] = [];
    acc[roundKey].push(match);
    return acc;
  }, {} as Record<string, MatchType[]>);

  // Accordion'ların Sıralanması (Şampiyonlar Ligi > Avrupa Ligi > Konferans Ligi)
  const getTournamentWeight = (roundName: string) => {
    if (roundName.includes("Şampiyonlar Ligi")) return 1;
    if (roundName.includes("Avrupa Ligi")) return 2;
    if (roundName.includes("Konferans Ligi")) return 3;
    return 4;
  };

  const sortedRoundKeys = Object.keys(groupedByRound).sort((a, b) => {
    const weightA = getTournamentWeight(a);
    const weightB = getTournamentWeight(b);
    
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    
    // Aynı turnuvaysa tur adına göre ters sıralama (Örn: 3. Ön Eleme, 2. Ön Eleme)
    return b.localeCompare(a);
  });

  // Modal kapandığında scroll'u aç
  useEffect(() => {
    if (selectedMatch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedMatch]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans selection:bg-indigo-500/30 pb-20 relative">
      {/* Header Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-blue-900/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 pt-28 sm:pt-32 pb-12 relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3 justify-center sm:justify-start">
              <Activity className="w-8 h-8 text-indigo-400" />
              {t("CupMat")}
            </h1>
            <p className="text-slate-400 text-lg">{t("Uluslararası Kupa Maçları")}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t("Canlı Veri Akışı")}
          </div>
        </div>

        {/* 4 Ana Sayfa (View Switcher) */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/50 w-full sm:w-fit mb-8 overflow-x-auto hide-scrollbar">
          {[
            { id: "matches", label: "Maçlar", icon: Calendar },
            { id: "stats", label: "İstatistikler", icon: BarChart3 },
            { id: "standings", label: "Puan Tablosu", icon: Trophy },
            { id: "sm_standings", label: "StatMatik Tablo", icon: Award }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setMainView(view.id as any)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                mainView === view.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <view.icon className="w-4 h-4" />
              {t(view.label)}
            </button>
          ))}
        </div>

        {/* Dinamik İçerik */}
        {mainView === "matches" && (
          <div className="space-y-6">
            
            {/* 1. SEVİYE: Kıta Sekmeleri */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
              {CONTINENTS.map(continent => (
                <button
                  key={continent.id}
                  onClick={() => setActiveContinent(continent.id)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                    activeContinent === continent.id
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {t(continent.name)}
                </button>
              ))}
            </div>

            {/* 2. SEVİYE: Turnuva Sekmeleri */}
            {activeContinent !== "all" && TOURNAMENTS[activeContinent as keyof typeof TOURNAMENTS] && (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-4 border-b border-slate-800/60">
                {TOURNAMENTS[activeContinent as keyof typeof TOURNAMENTS].map(tourney => (
                  <button
                    key={tourney.id}
                    onClick={() => setActiveTournament(tourney.id)}
                    className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${
                      activeTournament === tourney.id
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t(tourney.name)}
                  </button>
                ))}
              </div>
            )}

            {/* 3. SEVİYE: Turlar (Accordion) ve Maçlar */}
            {activeContinent !== "all" && activeContinent !== "europe" ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-700/50 rounded-2xl">
                <div className="text-5xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-white mb-2">{t("Yapım Aşamasında")}</h3>
                <p className="text-slate-400">{t("Bu kıtaya ait maç verileri çok yakında eklenecek!")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedRoundKeys.map(round => {
                  const isOpen = expandedRounds[round];
                  const matches = groupedByRound[round];
                  
                  // Maçları tarihe göre grupla (Ör: 13.08.2026)
                  const matchesByDate = matches.reduce((acc, match) => {
                    if (!acc[match.dateStr]) acc[match.dateStr] = [];
                    acc[match.dateStr].push(match);
                    return acc;
                  }, {} as Record<string, MatchType[]>);

                  // Tüm tarihleri sıralayarak İlk Maç / Rövanş mantığı kurma
                  const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
                    const [d1, m1, y1] = a.split('.');
                    const [d2, m2, y2] = b.split('.');
                    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
                  });
                  
                  // İlk tarihten en az 4 gün sonrası rövanştır (genelde 1 hafta olur)
                  const firstDateStr = sortedDates[0];
                  const [fd, fm, fy] = firstDateStr.split('.');
                  const firstDateTime = new Date(`${fy}-${fm}-${fd}`).getTime();

                  return (
                  <div key={round} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                    {/* Accordion Başlığı */}
                    <button 
                      onClick={() => toggleRound(round)}
                      className="w-full flex items-center justify-between p-4 sm:px-6 bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-white">{t(round)}</h3>
                      {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    </button>

                    {/* Accordion İçeriği (Tarihler ve Maçlar) */}
                    {isOpen && (
                      <div className="p-4 sm:p-6 space-y-6">
                        {sortedDates.map(dateStr => {
                          const [d, m, y] = dateStr.split('.');
                          const currentDateTime = new Date(`${y}-${m}-${d}`).getTime();
                          const diffDays = (currentDateTime - firstDateTime) / (1000 * 60 * 60 * 24);
                          const isSecondLeg = diffDays > 3;
                          
                          return (
                            <div key={dateStr} className="space-y-3">
                              {/* Tarih Başlığı */}
                              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                <h4 className="text-sm font-semibold text-slate-400">
                                  {dateStr}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                  {isSecondLeg ? "Rövanş Maçları" : "İlk Maçlar"}
                                </span>
                              </div>
                            
                            {/* O Tarihteki Maçlar */}
                            <div className="space-y-2">
                              {matchesByDate[dateStr].map(match => {
                                const tieDecided = match.isTieFinished;
                                const isTeam1Advancing = tieDecided && match.team1.isTieWinner;
                                const isTeam2Advancing = tieDecided && match.team2.isTieWinner;
                                const isTeam1Eliminated = tieDecided && !match.team1.isTieWinner;
                                const isTeam2Eliminated = tieDecided && !match.team2.isTieWinner;

                                return (
                                <div 
                                  key={match.id}
                                  onClick={() => setSelectedMatch(match)}
                                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-indigo-500/30"
                                >
                                  {/* EV SAHİBİ TAKIM */}
                                  <div className={`flex items-center justify-end gap-2 text-right transition-all ${
                                    isTeam1Advancing
                                      ? 'text-white'
                                      : isTeam1Eliminated
                                      ? 'text-slate-500 opacity-40'
                                      : 'text-slate-100'
                                  }`}>
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                      {match.team1.countryCode}
                                    </span>
                                    <span className={`text-sm sm:text-base ${
                                      isTeam1Advancing
                                        ? 'font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                                        : isTeam1Eliminated
                                        ? 'font-normal text-slate-500'
                                        : 'font-bold text-slate-100'
                                    }`}>
                                      {match.team1.name}
                                    </span>
                                    {isTeam1Advancing && (
                                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/40 shadow-sm" title="Turu Geçti">
                                        ✓
                                      </span>
                                    )}
                                  </div>

                                  {/* SKOR / SAAT */}
                                  <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                                    {["FT", "AET", "PEN"].includes(match.status) ? (
                                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700">
                                        <span className={`text-sm sm:text-lg tabular-nums ${isTeam1Advancing ? 'font-black text-emerald-400' : 'font-bold text-slate-100'}`}>{match.team1.score}</span>
                                        <span className="text-slate-500">-</span>
                                        <span className={`text-sm sm:text-lg tabular-nums ${isTeam2Advancing ? 'font-black text-emerald-400' : 'font-bold text-slate-100'}`}>{match.team2.score}</span>
                                      </div>
                                    ) : (
                                      <div className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                                        {match.time}
                                      </div>
                                    )}
                                    {/* Toplam Skor (Aggregate) */}
                                    {match.aggregateScore && ["FT", "AET", "PEN"].includes(match.status) && (
                                      <span className="text-[9px] sm:text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-1.5 py-0.2 rounded mt-1 shadow-sm">
                                        Top: {match.aggregateScore.team1} - {match.aggregateScore.team2}
                                      </span>
                                    )}
                                  </div>

                                  {/* DEPLASMAN TAKIM */}
                                  <div className={`flex items-center justify-start gap-2 text-left transition-all ${
                                    isTeam2Advancing
                                      ? 'text-white'
                                      : isTeam2Eliminated
                                      ? 'text-slate-500 opacity-40'
                                      : 'text-slate-100'
                                  }`}>
                                    {isTeam2Advancing && (
                                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/40 shadow-sm" title="Turu Geçti">
                                        ✓
                                      </span>
                                    )}
                                    <span className={`text-sm sm:text-base ${
                                      isTeam2Advancing
                                        ? 'font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                                        : isTeam2Eliminated
                                        ? 'font-normal text-slate-500'
                                        : 'font-bold text-slate-100'
                                    }`}>
                                      {match.team2.name}
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                      {match.team2.countryCode}
                                    </span>
                                  </div>

                                </div>
                              )})}
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

        {mainView === "stats" && <div className="text-center py-20 text-slate-400">{t("İstatistikler çok yakında eklenecek.")}</div>}
        {mainView === "standings" && <div className="text-center py-20 text-slate-400">{t("Puan tablosu çok yakında eklenecek.")}</div>}
        {mainView === "sm_standings" && <div className="text-center py-20 text-slate-400">{t("StatMatik Endeks tablosu çok yakında eklenecek.")}</div>}

      </div>

      {/* ========================================== */}
      {/* 📱 MAÇ DETAY KARTI (ZOOM MODAL) */}
      {/* ========================================== */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all" onClick={() => setSelectedMatch(null)}>
          <div 
            className="bg-[#0b1121] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()} // Dışarı tıklamayı engelleme
          >
            {/* Kapatma Tuşu */}
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedMatch(null); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 text-center relative overflow-hidden">
              {/* Arka Plan Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 mb-8 uppercase tracking-widest">
                  {t(selectedMatch.round)} • {selectedMatch.dateStr}
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Ev Sahibi Zoom */}
                  <div className={`flex-1 flex flex-col items-center gap-2 transition-all ${
                    selectedMatch.isTieFinished && selectedMatch.team1.isTieWinner
                      ? 'text-white'
                      : selectedMatch.isTieFinished && !selectedMatch.team1.isTieWinner
                      ? 'text-slate-500 opacity-40'
                      : 'text-slate-100'
                  }`}>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedMatch.team1.countryCode}</span>
                    <span className={`text-2xl sm:text-3xl ${
                      selectedMatch.isTieFinished && selectedMatch.team1.isTieWinner
                        ? 'font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                        : selectedMatch.isTieFinished && !selectedMatch.team1.isTieWinner
                        ? 'font-normal text-slate-500'
                        : 'font-bold text-slate-100'
                    }`}>
                      {selectedMatch.team1.name}
                    </span>
                    {selectedMatch.isTieFinished && selectedMatch.team1.isTieWinner && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40 mt-1 shadow-md">
                        ✓ Turu Geçti
                      </span>
                    )}
                  </div>

                  {/* Dev Skor */}
                  <div className="shrink-0 flex flex-col items-center">
                    {["FT", "AET", "PEN"].includes(selectedMatch.status) ? (
                      <div className="text-5xl sm:text-6xl font-black tabular-nums tracking-tighter text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        {selectedMatch.team1.score} <span className="text-slate-600 font-light mx-1">-</span> {selectedMatch.team2.score}
                      </div>
                    ) : (
                      <div className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                        {selectedMatch.time}
                      </div>
                    )}
                    <span className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-[0.2em]">{selectedMatch.status}</span>
                  </div>

                  {/* Deplasman Zoom */}
                  <div className={`flex-1 flex flex-col items-center gap-2 transition-all ${
                    selectedMatch.isTieFinished && selectedMatch.team2.isTieWinner
                      ? 'text-white'
                      : selectedMatch.isTieFinished && !selectedMatch.team2.isTieWinner
                      ? 'text-slate-500 opacity-40'
                      : 'text-slate-100'
                  }`}>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedMatch.team2.countryCode}</span>
                    <span className={`text-2xl sm:text-3xl ${
                      selectedMatch.isTieFinished && selectedMatch.team2.isTieWinner
                        ? 'font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                        : selectedMatch.isTieFinished && !selectedMatch.team2.isTieWinner
                        ? 'font-normal text-slate-500'
                        : 'font-bold text-slate-100'
                    }`}>
                      {selectedMatch.team2.name}
                    </span>
                    {selectedMatch.isTieFinished && selectedMatch.team2.isTieWinner && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40 mt-1 shadow-md">
                        ✓ Turu Geçti
                      </span>
                    )}
                  </div>
                </div>

                {/* Toplam Skor Detayı (Eğer Varsa) */}
                {(selectedMatch.aggregateScore || selectedMatch.team1.firstLegScore != null) && (
                  <div className="mt-10 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-2 text-sm">
                    {selectedMatch.team1.firstLegScore != null && (
                      <div className="flex justify-between text-slate-400">
                        <span>İlk Maç:</span>
                        <span className="font-bold">{selectedMatch.team1.firstLegScore} - {selectedMatch.team2.firstLegScore}</span>
                      </div>
                    )}
                    {selectedMatch.aggregateScore && (
                      <div className="flex justify-between text-indigo-300 font-bold border-t border-slate-700/50 pt-2 mt-1">
                        <span>Toplam Skor:</span>
                        <span>{selectedMatch.aggregateScore.team1} - {selectedMatch.aggregateScore.team2}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
