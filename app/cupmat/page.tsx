"use client";

import React, { useState } from "react";
import { Calendar, Activity, MapPin, Trophy, Award, BarChart3, ChevronRight } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

// Mock Data
const TOURNAMENTS = [
  { id: "ucl", name: "Champions League", icon: "🏆" },
  { id: "uel", name: "Europa League", icon: "🌍" },
  { id: "lib", name: "Copa Libertadores", icon: "🌎" },
  { id: "afc", name: "AFC Champions League", icon: "🌏" },
];

const MOCK_MATCHES = {
  "ucl": [
    {
      id: "m1",
      date: "10 Ağustos 2026",
      round: "Final",
      status: "FT",
      venue: "Wembley, London",
      team1: { name: "Real Madrid", flag: "🇪🇸", score: 2, isWinner: true },
      team2: { name: "Man City", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: 1, isWinner: false },
    },
    {
      id: "m2",
      date: "05 Ağustos 2026",
      round: "Yarı Final",
      status: "FT",
      venue: "Santiago Bernabéu",
      team1: { name: "Real Madrid", flag: "🇪🇸", score: 3, isWinner: true },
      team2: { name: "Bayern Munich", flag: "🇩🇪", score: 1, isWinner: false },
    },
    {
      id: "m3",
      date: "04 Ağustos 2026",
      round: "Yarı Final",
      status: "FT",
      venue: "Etihad Stadium",
      team1: { name: "Man City", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: 2, isWinner: true },
      team2: { name: "PSG", flag: "🇫🇷", score: 0, isWinner: false },
    }
  ],
  "uel": [
    {
      id: "m4",
      date: "09 Ağustos 2026",
      round: "Final",
      status: "FT",
      venue: "Aviva Stadium",
      team1: { name: "Bayer Leverkusen", flag: "🇩🇪", score: 3, isWinner: true },
      team2: { name: "Liverpool", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: 2, isWinner: false },
    }
  ]
};

const MOCK_WINNERS = {
  "ucl": [
    { team: "Real Madrid", flag: "🇪🇸", titles: 15 },
    { team: "AC Milan", flag: "🇮🇹", titles: 7 },
    { team: "Bayern Munich", flag: "🇩🇪", titles: 6 },
    { team: "Liverpool", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", titles: 6 },
    { team: "Barcelona", flag: "🇪🇸", titles: 5 },
    { team: "Ajax", flag: "🇳🇱", titles: 4 }
  ],
  "uel": [
    { team: "Sevilla", flag: "🇪🇸", titles: 7 },
    { team: "Inter Milan", flag: "🇮🇹", titles: 3 },
    { team: "Juventus", flag: "🇮🇹", titles: 3 },
    { team: "Liverpool", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", titles: 3 },
    { team: "Atlético Madrid", flag: "🇪🇸", titles: 3 }
  ],
  "lib": [
    { team: "Independiente", flag: "🇦🇷", titles: 7 },
    { team: "Boca Juniors", flag: "🇦🇷", titles: 6 },
    { team: "Peñarol", flag: "🇺🇾", titles: 5 },
    { team: "River Plate", flag: "🇦🇷", titles: 4 },
    { team: "Estudiantes", flag: "🇦🇷", titles: 4 }
  ],
  "afc": [
    { team: "Al-Hilal", flag: "🇸🇦", titles: 4 },
    { team: "Pohang Steelers", flag: "🇰🇷", titles: 3 },
    { team: "Urawa Red Diamonds", flag: "🇯🇵", titles: 3 },
    { team: "Al-Ain", flag: "🇦🇪", titles: 2 },
    { team: "Esteghlal", flag: "🇮🇷", titles: 2 }
  ]
};

const MOCK_STANDINGS = {
  "ucl": [
    { rank: 1, team: "Real Madrid", flag: "🇪🇸", p: 8, w: 7, d: 1, l: 0, gf: 21, ga: 5, gd: 16, pts: 22, sm_idx: 9.8 },
    { rank: 2, team: "Man City", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", p: 8, w: 6, d: 2, l: 0, gf: 24, ga: 6, gd: 18, pts: 20, sm_idx: 9.5 },
    { rank: 3, team: "Bayern Munich", flag: "🇩🇪", p: 8, w: 6, d: 1, l: 1, gf: 19, ga: 7, gd: 12, pts: 19, sm_idx: 9.2 },
    { rank: 4, team: "Arsenal", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", p: 8, w: 5, d: 2, l: 1, gf: 15, ga: 6, gd: 9, pts: 17, sm_idx: 8.7 },
    { rank: 5, team: "Inter Milan", flag: "🇮🇹", p: 8, w: 5, d: 2, l: 1, gf: 12, ga: 4, gd: 8, pts: 17, sm_idx: 8.5 }
  ]
};

// Chronological order for sorting rounds
const ROUND_ORDER = [
  "1. Eleme", "2. Eleme", "3. Eleme", "Play-off", 
  "Grup Aşaması", "Son 16", "Çeyrek Final", "Yarı Final", "Final"
];

export default function CupMatMatchCenter() {
  const { t } = useTranslation();
  const [mainView, setMainView] = useState<"matches" | "stats">("matches");
  const [activeTab, setActiveTab] = useState(TOURNAMENTS[0].id);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<string>("");

  const activeMatches = MOCK_MATCHES[activeTab as keyof typeof MOCK_MATCHES] || [];
  const activeWinners = MOCK_WINNERS[activeTab as keyof typeof MOCK_WINNERS] || [];
  const activeStandings = MOCK_STANDINGS[activeTab as keyof typeof MOCK_STANDINGS] || [];
  
  // Extract and sort rounds chronologically
  const availableRounds = Array.from(new Set(activeMatches.map(m => m.round))).sort((a, b) => {
    const idxA = ROUND_ORDER.indexOf(a);
    const idxB = ROUND_ORDER.indexOf(b);
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });
  
  const currentRound = availableRounds.includes(activeRound) ? activeRound : (availableRounds[0] || "");
  const filteredMatches = activeMatches.filter(m => m.round === currentRound);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans selection:bg-indigo-500/30 pb-20">
      {/* Header Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-blue-900/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 pt-28 sm:pt-32 pb-12 relative z-10">
        
        {/* Header */}
        <div className="mb-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3 justify-center sm:justify-start">
              <Activity className="w-8 h-8 text-indigo-400" />
              {t("CupMat")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {t("Kupa Maçları")}
              </span>
            </h1>
            <p className="text-slate-400 text-lg">{t("Küresel Kulüpler Veri Merkezi & Maç Analiz Laboratuvarı")}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t("Canlı Veri Akışı")}
          </div>
        </div>

        {/* View Switcher & Tournament Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-700/50 w-fit">
            <button
              onClick={() => setMainView("matches")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                mainView === "matches"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              {t("Maç Merkezi")}
            </button>
            <button
              onClick={() => setMainView("stats")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                mainView === "stats"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {t("İstatistikler")}
            </button>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
            {TOURNAMENTS.map(tItem => (
              <button
                key={tItem.id}
                onClick={() => setActiveTab(tItem.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 font-medium text-sm border ${
                  activeTab === tItem.id
                    ? "bg-slate-800 border-indigo-500/50 text-white"
                    : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span className="text-base">{tItem.icon}</span>
                {t(tItem.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        {mainView === "stats" ? (
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                  StatMatik {t("Karma Güç Tablosu")}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{t("Takımların turnuva bazlı genel performans endeksi ve puan durumu")}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>{t("Güncel Sezon")}: 2026/27</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold w-16 text-center">#</th>
                    <th className="px-6 py-4 font-semibold">{t("Takım")}</th>
                    <th className="px-4 py-4 font-semibold text-center" title={t("Oynanan Maç")}>O</th>
                    <th className="px-4 py-4 font-semibold text-center" title={t("Galibiyet")}>G</th>
                    <th className="px-4 py-4 font-semibold text-center" title={t("Beraberlik")}>B</th>
                    <th className="px-4 py-4 font-semibold text-center" title={t("Mağlubiyet")}>M</th>
                    <th className="px-4 py-4 font-semibold text-center" title={t("Atılan Gol")}>AG</th>
                    <th className="px-4 py-4 font-semibold text-center" title={t("Yenilen Gol")}>YG</th>
                    <th className="px-4 py-4 font-semibold text-center" title={t("Averaj")}>AV</th>
                    <th className="px-4 py-4 font-semibold text-center text-indigo-300">P</th>
                    <th className="px-6 py-4 font-bold text-center text-cyan-400" title={t("StatMatik Endeksi")}>SM Endeksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeStandings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                        {t("Bu turnuva için henüz puan durumu/istatistik verisi bulunmuyor.")}
                      </td>
                    </tr>
                  ) : (
                    activeStandings.map((team, idx) => (
                      <tr key={team.team} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            idx < 8 ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500'
                          }`}>
                            {team.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{team.flag}</span>
                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{team.team}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-slate-400">{team.p}</td>
                        <td className="px-4 py-4 text-center text-emerald-400">{team.w}</td>
                        <td className="px-4 py-4 text-center text-slate-400">{team.d}</td>
                        <td className="px-4 py-4 text-center text-rose-400">{team.l}</td>
                        <td className="px-4 py-4 text-center text-slate-300">{team.gf}</td>
                        <td className="px-4 py-4 text-center text-slate-300">{team.ga}</td>
                        <td className="px-4 py-4 text-center text-slate-300">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td className="px-4 py-4 text-center font-bold text-indigo-300 text-lg">{team.pts}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 font-black tracking-wide shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            {team.sm_idx}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Round Sub-Tabs */}
        {availableRounds.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-10 pb-2 border-b border-slate-800/60">
            {availableRounds.map(round => (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-t-lg transition-all duration-300 font-medium text-sm border-b-2 ${
                  currentRound === round
                    ? "border-indigo-400 text-indigo-300 bg-indigo-900/20"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                }`}
              >
                {t(round)}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Grid: Matches (Left) & Winners (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline Matches */}
          <div className="lg:col-span-2 space-y-6 relative before:absolute before:inset-y-0 before:left-[27px] sm:before:left-[39px] before:w-[2px] before:bg-slate-800/80">
            
            {filteredMatches.length === 0 ? (
              <div className="pl-16 sm:pl-24 py-12 text-slate-500 text-center text-lg">
                {t("Bu turnuvaya ait güncel veri bulunamadı.")}
              </div>
            ) : (
              filteredMatches.map((match, index) => {
                const isExpanded = expandedMatchId === match.id;
                
                return (
                  <div key={match.id} className="relative pl-16 sm:pl-24 group">
                    
                    {/* Timeline Dot */}
                    <div className={`absolute left-[20px] sm:left-[32px] w-4 h-4 rounded-full border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10 transition-transform duration-300 ${isExpanded ? 'top-6 bg-indigo-500 scale-125' : 'top-1/2 -translate-y-1/2 bg-slate-800 group-hover:scale-125 group-hover:bg-indigo-500/50'}`} />
                    
                    {/* Match Card (Glassmorphism) */}
                    <div 
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      className={`bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl transition-all duration-300 hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 cursor-pointer overflow-hidden relative ${isExpanded ? 'p-5 sm:p-6' : 'p-3 sm:p-4'}`}
                    >
                      
                      {/* Subtle Neon Glow Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

                      {isExpanded ? (
                        <>
                          {/* Match Meta Info (Expanded) */}
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700/50 pb-4">
                            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 font-medium">
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/80 text-indigo-300 border border-slate-700 shadow-sm">
                                <Calendar className="w-3.5 h-3.5" /> {match.date}
                              </span>
                              <span className="text-slate-600">•</span>
                              <span className="text-amber-400/90 uppercase tracking-wider font-semibold">{t(match.round)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-black/20 px-3 py-1.5 rounded-md">
                              <MapPin className="w-3 h-3 text-slate-400" /> {match.venue}
                            </div>
                          </div>

                          {/* Scoreboard Layout (Expanded) */}
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
                            
                            {/* Team 1 */}
                            <div className={`flex items-center gap-3 sm:gap-4 justify-end transition-opacity duration-300 ${match.team1.isWinner ? 'opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]' : 'opacity-40 grayscale-[30%]'}`}>
                              <span className={`text-lg sm:text-2xl font-bold truncate max-w-[120px] sm:max-w-full ${match.team1.isWinner ? 'text-white' : 'text-slate-400'}`}>
                                {match.team1.name}
                              </span>
                              <span className="text-2xl sm:text-4xl shadow-sm">{match.team1.flag}</span>
                            </div>

                            {/* Score Bubble */}
                            <div className="flex flex-col items-center justify-center min-w-[80px] sm:min-w-[100px] z-10">
                              <div className="bg-[#0b1121]/90 border border-slate-700/80 shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                                <span className={`text-xl sm:text-3xl font-black tabular-nums ${match.team1.isWinner ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-500'}`}>
                                  {match.team1.score}
                               </span>
                                <span className="text-slate-600 font-light text-lg sm:text-xl">-</span>
                                <span className={`text-xl sm:text-3xl font-black tabular-nums ${match.team2.isWinner ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-500'}`}>
                                  {match.team2.score}
                                </span>
                              </div>
                              <span className="text-[10px] sm:text-xs font-bold text-slate-500 mt-2.5 tracking-[0.2em]">{match.status}</span>
                            </div>

                            {/* Team 2 */}
                            <div className={`flex items-center gap-3 sm:gap-4 justify-start transition-opacity duration-300 ${match.team2.isWinner ? 'opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]' : 'opacity-40 grayscale-[30%]'}`}>
                              <span className="text-2xl sm:text-4xl shadow-sm">{match.team2.flag}</span>
                              <span className={`text-lg sm:text-2xl font-bold truncate max-w-[120px] sm:max-w-full ${match.team2.isWinner ? 'text-white' : 'text-slate-400'}`}>
                                {match.team2.name}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Compact List Row */
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 w-[70px] sm:w-[130px] shrink-0 text-xs sm:text-sm text-slate-400">
                            <span className="font-semibold text-amber-400/90 hidden sm:inline-block">{t(match.round)}</span>
                            <span>{match.date.split(' ')[0]}</span>
                          </div>
                          
                          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4">
                            <div className={`flex items-center gap-2 flex-1 justify-end ${match.team1.isWinner ? 'text-white font-bold' : 'text-slate-400 font-medium'}`}>
                              <span className="truncate text-sm sm:text-base">{match.team1.name}</span>
                              <span className="text-lg sm:text-xl hidden sm:inline-block">{match.team1.flag}</span>
                            </div>
                            
                            <div className="bg-[#0b1121]/80 border border-slate-700/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center gap-1.5 shrink-0 justify-center">
                              <span className={`text-sm sm:text-base font-bold ${match.team1.isWinner ? 'text-indigo-400' : 'text-slate-500'}`}>{match.team1.score}</span>
                              <span className="text-slate-600 font-light">-</span>
                              <span className={`text-sm sm:text-base font-bold ${match.team2.isWinner ? 'text-indigo-400' : 'text-slate-500'}`}>{match.team2.score}</span>
                            </div>

                            <div className={`flex items-center gap-2 flex-1 justify-start ${match.team2.isWinner ? 'text-white font-bold' : 'text-slate-400 font-medium'}`}>
                              <span className="text-lg sm:text-xl hidden sm:inline-block">{match.team2.flag}</span>
                              <span className="truncate text-sm sm:text-base">{match.team2.name}</span>
                            </div>
                          </div>
                          
                          <div className="shrink-0 text-[10px] sm:text-xs font-bold text-slate-500 w-[30px] sm:w-[40px] text-right">
                            {match.status}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
            
          </div>

          {/* Winners / Statistics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{t("Tarihin En İyileri")}</h3>
                  <p className="text-sm text-slate-400">{t("En Çok Kazanan Takımlar")}</p>
                </div>
              </div>

              {activeWinners.length === 0 ? (
                <div className="text-slate-500 text-sm text-center py-8">
                  {t("Bu turnuva için veri bulunamadı.")}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeWinners.map((winner, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{winner.flag}</span>
                        <span className="font-semibold text-slate-200">{winner.team}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-700">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-amber-400">{winner.titles}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
          </>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
