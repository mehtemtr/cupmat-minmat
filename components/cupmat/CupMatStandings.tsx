"use client";

import React, { useState, useEffect } from "react";
import { Trophy, RefreshCw, Shield, Award, CheckCircle2, Flame, Globe, ChevronRight, ChevronDown } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

interface StandingTeam {
  rank?: number;
  team: string;
  teamId?: number;
  logo?: string;
  country?: string;
  continent?: string;
  tournaments?: string[];
  played: number;
  win: number;
  draw: number;
  lose: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  ppg?: number;
  ppg1000?: number;
  form?: string[];
  league?: string;
  group?: string;
}

const CONTINENTS = [
  { id: "all", name: "Tümü (Dünya)", icon: "🌍" },
  { id: "europe", name: "Avrupa", icon: "🔵" },
  { id: "america", name: "Amerika", icon: "🟢" },
  { id: "asia", name: "Asya", icon: "🔴" },
  { id: "africa", name: "Afrika", icon: "🟠" },
];

const CONTINENT_TOURNAMENTS: Record<string, Array<{ id: number; name: string; icon: string; description: string; isLeagueStage?: boolean }>> = {
  europe: [
    { id: 2, name: "Şampiyonlar Ligi", icon: "🏆", description: "36 Takımlı Lig Aşaması — İlk 8 Doğrudan Son 16, 9-24 Play-off", isLeagueStage: true },
    { id: 3, name: "Avrupa Ligi", icon: "🟠", description: "36 Takımlı Lig Aşaması — İlk 8 Doğrudan Son 16, 9-24 Play-off", isLeagueStage: true },
    { id: 848, name: "Konferans Ligi", icon: "🟢", description: "36 Takımlı Lig Aşaması — İlk 8 Doğrudan Son 16, 9-24 Play-off", isLeagueStage: true },
    { id: 5, name: "UEFA Uluslar Ligi", icon: "🌍", description: "A, B, C ve D Ligleri — 4'erli ve 3'erli Grup Formatı", isLeagueStage: false },
  ],
  america: [
    { id: 13, name: "Copa Libertadores", icon: "🔵", description: "Güney Amerika 1 Numaralı Kulüpler Turnuvası", isLeagueStage: true },
    { id: 11, name: "Copa Sudamericana", icon: "🟠", description: "Güney Amerika 2 Numaralı Kulüpler Turnuvası", isLeagueStage: true },
    { id: 16, name: "CONCACAF Şampiyonlar", icon: "🟡", description: "Kuzey & Orta Amerika Kulüpler Şampiyonası", isLeagueStage: true },
  ],
  asia: [
    { id: 17, name: "AFC Şampiyonlar Ligi Elite", icon: "🔴", description: "Asya 1 Numaralı Kulüpler Ligi (Doğu & Batı)", isLeagueStage: true },
    { id: 18, name: "AFC Şampiyonlar Ligi Two", icon: "🟢", description: "Asya 2 Numaralı Kulüpler Turnuvası", isLeagueStage: true },
  ],
  africa: [
    { id: 12, name: "CAF Şampiyonlar Ligi", icon: "🟢", description: "Afrika 1 Numaralı Kulüpler Şampiyonası", isLeagueStage: true },
    { id: 20, name: "CAF Konfederasyon Kupası", icon: "🟠", description: "Afrika 2 Numaralı Kulüpler Kupası", isLeagueStage: true },
  ],
  world: [
    { id: 15, name: "FIFA Kulüpler Dünya Kupası", icon: "🌐", description: "Dünya Kulüpler Şampiyonası", isLeagueStage: true },
    { id: 1, name: "FIFA Dünya Kupası 2026", icon: "🏆", description: "Dünya Kupası 2026", isLeagueStage: false },
  ]
};

export function CupMatStandings() {
  const { t } = useTranslation();
  
  // Ana Sekme: "global_ppg" (Kıtalararası Kulüp Endeksi) veya "tournaments" (Turnuva Lig Tabloları)
  const [activeTab, setActiveTab] = useState<"global_ppg" | "tournaments">("global_ppg");
  
  // Global MBP Filtreleri
  const [globalContinent, setGlobalContinent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [globalStandings, setGlobalStandings] = useState<StandingTeam[]>([]);
  const [globalLoading, setGlobalLoading] = useState<boolean>(true);

  // Turnuva Puan Tablosu State'leri
  const [tourneyContinent, setTourneyContinent] = useState<string>("europe");
  const [selectedTournament, setSelectedTournament] = useState<number>(2);
  const [tourneyStandings, setTourneyStandings] = useState<StandingTeam[]>([]);
  const [tourneyLoading, setTourneyLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);

  // UNL 3-Level State (Lig -> Grup -> Tablo)
  const [unlOpenLeagues, setUnlOpenLeagues] = useState<Record<string, boolean>>({ "Lig A": true });
  const [unlOpenGroups, setUnlOpenGroups] = useState<Record<string, boolean>>({ "Lig A - 1. Grup": true });

  const toggleUnlLeague = (leagueKey: string) => {
    setUnlOpenLeagues(prev => ({ ...prev, [leagueKey]: !prev[leagueKey] }));
  };

  const toggleUnlGroup = (groupKey: string) => {
    setUnlOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // 1. Fetch Global Club MBP (x1000) Data
  const fetchGlobalStandings = async (continent: string) => {
    setGlobalLoading(true);
    try {
      const res = await fetch(`/api/cupmat/standings?view=global_ppg&continent=${continent}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.standings)) {
          setGlobalStandings(data.standings);
        }
      }
    } catch (err) {
      console.error("Failed to load global MBP standings:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  // 2. Fetch Tournament Standings Data
  const fetchTournamentStandings = async (tourneyId: number) => {
    setTourneyLoading(true);
    try {
      const res = await fetch(`/api/cupmat/standings?tournament=${tourneyId}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.standings)) {
          setTourneyStandings(data.standings);
          setIsLive(data.isLive || false);
        }
      }
    } catch (err) {
      console.error("Failed to load tournament standings:", err);
    } finally {
      setTourneyLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "global_ppg") {
      fetchGlobalStandings(globalContinent);
    }
  }, [activeTab, globalContinent]);

  useEffect(() => {
    if (activeTab === "tournaments") {
      fetchTournamentStandings(selectedTournament);
    }
  }, [activeTab, selectedTournament]);

  // Turnuva kıtası değiştiğinde ilk turnuvayı seç
  const handleContinentChangeForTourney = (contId: string) => {
    setTourneyContinent(contId);
    const available = CONTINENT_TOURNAMENTS[contId] || [];
    if (available.length > 0) {
      setSelectedTournament(available[0].id);
    }
  };

  // Global filtrelenmiş takımlar
  const filteredGlobalTeams = globalStandings.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.team.toLowerCase().includes(q) ||
      (t.country && t.country.toLowerCase().includes(q))
    );
  });

  const currentTourneys = CONTINENT_TOURNAMENTS[tourneyContinent] || CONTINENT_TOURNAMENTS.europe;
  const currentTourney = currentTourneys.find((t) => t.id === selectedTournament) || currentTourneys[0];

  return (
    <div className="w-full space-y-6 select-none animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 🚀 ÜST ANA MOD SEÇİCİ (Global MBP x1000 vs Turnuva Lig Tabloları) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3.5 sm:p-4 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("global_ppg")}
            className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer border ${
              activeTab === "global_ppg"
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-orange-500/25 border-orange-400 scale-[1.02]"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <span className="text-base sm:text-lg">🌍</span>
            <span>{t("Uluslararası Kulüp Endeksi")} <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-mono ml-1">MBP ×1000</span></span>
          </button>

          <button
            onClick={() => setActiveTab("tournaments")}
            className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer border ${
              activeTab === "tournaments"
                ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-black shadow-lg shadow-indigo-500/25 border-cyan-400 scale-[1.02]"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <span className="text-base sm:text-lg">🏆</span>
            <span>{t("Turnuva & Lig Puan Durumu")}</span>
          </button>
        </div>

        {/* Yenile butonu */}
        <div className="flex items-center justify-end w-full sm:w-auto">
          <button
            onClick={() => {
              if (activeTab === "global_ppg") fetchGlobalStandings(globalContinent);
              else fetchTournamentStandings(selectedTournament);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="Tabloyu Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(activeTab === "global_ppg" ? globalLoading : tourneyLoading) ? "animate-spin text-indigo-400" : ""}`} />
            <span>{t("Yenile")}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌍 1. GÖRÜNÜM: ULUSLARARASI TÜM KULÜPLERİN MBP (x1000) ENDEKSİ */}
      {/* ========================================================================= */}
      {activeTab === "global_ppg" && (
        <div className="space-y-4">
          
          {/* Kıta Filtreleme Butonları & Arama Kutusu */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
              {CONTINENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setGlobalContinent(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                    globalContinent === c.id
                      ? "bg-white text-slate-950 border-white shadow-md font-black"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{t(c.name)}</span>
                </button>
              ))}
            </div>

            {/* Arama Inputu */}
            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Takım veya ülke ara...")}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Açıklama Kartı */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span><strong>{t("Maç Başına Puan Endeksi (MBP × 1000):")}</strong> {t("Uluslararası maçlarda alınan (Toplam Puan ÷ Maç Sayısı) × 1000 formülü ile hesaplanan global güç katsayısıdır.")}</span>
            </div>
            <span className="font-mono text-[11px] text-amber-400/80 shrink-0">{t("Toplam")} {filteredGlobalTeams.length} {t("Takım")}</span>
          </div>

          {/* Global MBP x1000 Tablosu */}
          <div className="bg-[#0b1121]/90 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                  <tr>
                    <th className="py-3.5 pl-4 sm:pl-6 pr-2 text-center w-12 sm:w-14">#</th>
                    <th className="py-3.5 px-2 sm:px-4">{t("Takım")}</th>
                    <th className="py-3.5 px-2 text-center hidden md:table-cell">{t("Kıta / Turnuva")}</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono">O</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">G</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">B</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">M</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden lg:table-cell">A</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden lg:table-cell">Y</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono font-bold">AV</th>
                    <th className="py-3.5 px-2 sm:px-3 text-center w-12 sm:w-14 font-mono text-slate-300 font-bold">{t("P")}</th>
                    <th className="py-3.5 pl-2 pr-4 sm:pr-6 text-center w-24 sm:w-28 font-mono text-amber-300 font-black text-xs sm:text-sm bg-amber-500/10 border-l border-amber-500/20">
                      MBP ×1000
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {globalLoading ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                          <span className="text-xs font-bold text-slate-400">{t("Kıtalararası Kulüp Endeksi hesaplanıyor...")}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredGlobalTeams.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-16 text-center text-slate-400">
                        {t("Eşleşen takım bulunamadı.")}
                      </td>
                    </tr>
                  ) : (
                    filteredGlobalTeams.map((team, idx) => {
                      const isTop3 = idx < 3;
                      const mbp = team.ppg1000 || 0;

                      return (
                        <tr
                          key={team.team}
                          className={`transition-colors hover:bg-slate-800/40 ${
                            isTop3 ? "bg-amber-950/15 text-slate-100" : "text-slate-300"
                          }`}
                        >
                          <td className="py-3 pl-4 sm:pl-6 pr-2 text-center font-mono font-black">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                                idx === 0
                                  ? "bg-amber-400 text-black shadow-md shadow-amber-500/40 font-black"
                                  : idx === 1
                                  ? "bg-slate-300 text-black font-black"
                                  : idx === 2
                                  ? "bg-amber-700/80 text-white font-black"
                                  : "bg-slate-900 text-slate-400 border border-slate-800"
                              }`}
                            >
                              {idx + 1}
                            </span>
                          </td>

                          <td className="py-3 px-2 sm:px-4">
                            <div className="flex items-center gap-2.5">
                              {team.logo ? (
                                <img
                                  src={team.logo}
                                  alt={team.team}
                                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                  ⚽
                                </div>
                              )}

                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`font-bold sm:text-sm text-xs truncate max-w-[130px] sm:max-w-[200px] ${
                                  isTop3 ? "text-white font-extrabold" : "text-slate-200"
                                }`}>
                                  {team.team}
                                </span>
                                {team.country && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 hidden sm:inline-block">
                                    {team.country}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-2 text-center hidden md:table-cell">
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {(team.tournaments || []).slice(0, 2).map((tName) => (
                                <span
                                  key={tName}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 truncate max-w-[130px]"
                                  title={tName}
                                >
                                  {tName}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-300 font-bold">{team.played}</td>
                          <td className="py-3 px-2 sm:px-3 text-center font-mono text-emerald-400 hidden xs:table-cell">{team.win}</td>
                          <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden xs:table-cell">{team.draw}</td>
                          <td className="py-3 px-2 sm:px-3 text-center font-mono text-rose-400 hidden xs:table-cell">{team.lose}</td>
                          <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden lg:table-cell">{team.gf}</td>
                          <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden lg:table-cell">{team.ga}</td>
                          <td className={`py-3 px-2 sm:px-3 text-center font-mono font-bold ${
                            team.gd > 0 ? "text-emerald-400" : team.gd < 0 ? "text-rose-400" : "text-slate-400"
                          }`}>
                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-200 font-bold">
                            {team.pts}
                          </td>
                          
                          {/* MBP x1000 Kolonu */}
                          <td className="py-3 pl-2 pr-4 sm:pr-6 text-center font-mono font-black bg-amber-500/5 border-l border-amber-500/20">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-black tracking-wider ${
                              mbp >= 2500
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20"
                                : mbp >= 1800
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : mbp >= 1000
                                ? "bg-slate-800 text-slate-300 border border-slate-700"
                                : "bg-rose-950/30 text-rose-300 border border-rose-800/40"
                            }`}>
                              {mbp}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏆 2. GÖRÜNÜM: TURNUVA VE LİG AŞAMASI PUAN TABLOLARI */}
      {/* ========================================================================= */}
      {activeTab === "tournaments" && (
        <div className="space-y-6">
          
          {/* 1. SEVİYE: Kıta Seçimi */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            {Object.keys(CONTINENT_TOURNAMENTS).map((contKey) => {
              const contNames: Record<string, string> = {
                europe: "Avrupa Kupaları",
                america: "Amerika Kupaları",
                asia: "Asya Kupaları",
                africa: "Afrika Kupaları",
                world: "Dünya Turnuvaları"
              };
              const isSelected = tourneyContinent === contKey;
              return (
                <button
                  key={contKey}
                  onClick={() => handleContinentChangeForTourney(contKey)}
                  className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-950 border-white shadow-lg font-black"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {t(contNames[contKey] || contKey)}
                </button>
              );
            })}
          </div>

          {/* 2. SEVİYE: Turnuva Seçimi Sekmeleri */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            {currentTourneys.map((tourney) => {
              const isSelected = selectedTournament === tourney.id;
              return (
                <button
                  key={tourney.id}
                  onClick={() => setSelectedTournament(tourney.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/25 font-black"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{tourney.icon}</span>
                  <span>{t(tourney.name)}</span>
                </button>
              );
            })}
          </div>

          {/* Turnuva Açıklaması */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <span className="font-semibold">{currentTourney?.description}</span>
            <span className="font-mono text-slate-500">
              {currentTourney?.isLeagueStage ? t("Lig Aşaması Formatı") : t("Grup/Milli Format")}
            </span>
          </div>

          {/* Standings Table Container (36-Team League Mode vs UNL 3-Level Drilldown Mode) */}
          {currentTourney?.isLeagueStage ? (
            <div className="bg-[#0b1121]/90 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                    <tr>
                      <th className="py-3.5 pl-4 sm:pl-6 pr-2 text-center w-12 sm:w-14">#</th>
                      <th className="py-3.5 px-2 sm:px-4">{t("Takım")}</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono">O</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">G</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">B</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">M</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden md:table-cell">A</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden md:table-cell">Y</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono font-bold">AV</th>
                      <th className="py-3.5 px-2 sm:px-3 text-center w-12 sm:w-16 font-mono text-white font-black text-sm">P</th>
                      <th className="py-3.5 pl-2 pr-4 sm:pr-6 text-center w-20 sm:w-24 font-mono text-amber-300 font-black text-xs sm:text-sm bg-amber-500/10 border-l border-amber-500/20">
                        MBP ×1000
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {tourneyLoading ? (
                      <tr>
                        <td colSpan={11} className="py-20 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                            <span className="text-xs font-bold text-slate-400">{t("Puan durumu yükleniyor...")}</span>
                          </div>
                        </td>
                      </tr>
                    ) : tourneyStandings.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-20 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
                              ⚽
                            </div>
                            <span className="font-extrabold text-white text-sm sm:text-base">{t("Puan Tablosu Güncelleniyor")}</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tourneyStandings.map((team, idx) => {
                        const rank = team.rank || idx + 1;
                        const isDirect16 = rank <= 8;
                        const isPlayoff = rank >= 9 && rank <= 24;
                        const mbp = team.ppg1000 || (team.played > 0 ? Math.round((team.pts / team.played) * 1000) : 0);

                        return (
                          <tr
                            key={team.teamId || team.team || idx}
                            className={`transition-colors hover:bg-slate-800/40 ${
                              isDirect16
                                ? "bg-emerald-950/15 border-l-4 border-l-emerald-400 text-slate-100"
                                : isPlayoff
                                ? "bg-amber-950/10 border-l-4 border-l-amber-400/80 text-slate-200"
                                : "border-l-4 border-l-slate-800 text-slate-400 opacity-85"
                            }`}
                          >
                            <td className="py-3 pl-4 sm:pl-6 pr-2 text-center font-mono font-black">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                                  isDirect16
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : isPlayoff
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-slate-900 text-slate-500 border border-slate-800"
                                }`}
                              >
                                {rank}
                              </span>
                            </td>

                            <td className="py-3 px-2 sm:px-4">
                              <div className="flex items-center gap-2.5">
                                {team.logo ? (
                                  <img
                                    src={team.logo}
                                    alt={team.team}
                                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
                                  />
                                ) : (
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                    ⚽
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <span className={`font-bold sm:text-sm text-xs truncate max-w-[140px] sm:max-w-[220px] ${
                                    isDirect16 ? "text-white font-extrabold" : "text-slate-200"
                                  }`}>
                                    {team.team}
                                  </span>
                                  {team.country && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 hidden sm:inline-block">
                                      {team.country}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-300 font-bold">{team.played}</td>
                            <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-300 hidden xs:table-cell">{team.win}</td>
                            <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden xs:table-cell">{team.draw}</td>
                            <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden xs:table-cell">{team.lose}</td>
                            <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden md:table-cell">{team.gf}</td>
                            <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden md:table-cell">{team.ga}</td>
                            <td className={`py-3 px-2 sm:px-3 text-center font-mono font-bold ${
                              team.gd > 0 ? "text-emerald-400" : team.gd < 0 ? "text-rose-400" : "text-slate-400"
                            }`}>
                              {team.gd > 0 ? `+${team.gd}` : team.gd}
                            </td>
                            <td className="py-3 px-2 sm:px-3 text-center font-mono font-black text-amber-400 text-sm sm:text-base">
                              {team.pts}
                            </td>
                            <td className="py-3 pl-2 pr-4 sm:pr-6 text-center font-mono font-black text-amber-300 bg-amber-500/5 border-l border-amber-500/20 text-xs sm:text-sm">
                              {mbp}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* UEFA Legend Bar */}
              <div className="bg-slate-950/90 border-t border-slate-800 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400" />
                    <span className="font-bold text-emerald-300">1 - 8: {t("Son 16 Turu (Doğrudan)")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400" />
                    <span className="font-bold text-amber-300">9 - 24: {t("Play-off Turu")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600" />
                    <span className="font-bold text-slate-400">25 - 36: {t("Elendi")}</span>
                  </div>
                </div>
                <div className="text-slate-500 italic text-[11px]">{t("UEFA 36 Takımlı Yeni Lig Sistemi")}</div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* ULUSLAR LİGİ 3 KADEMELİ PUAN DURUMU (Lig A/B/C/D -> Gruplar -> Tablo)     */
            /* ========================================================================= */
            <div className="space-y-4">
              {["Lig A", "Lig B", "Lig C", "Lig D"].map((leagueKey) => {
                const isLeagueOpen = unlOpenLeagues[leagueKey];
                const leagueLetter = leagueKey.replace("Lig ", "").trim();

                const groupsInLeague = leagueLetter === "D"
                  ? ["1. Grup", "2. Grup"]
                  : ["1. Grup", "2. Grup", "3. Grup", "4. Grup"];

                return (
                  <div key={leagueKey} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
                    {/* 1. KADEME: Lig Başlığı (Lig A, Lig B, Lig C, Lig D) */}
                    <button
                      onClick={() => toggleUnlLeague(leagueKey)}
                      className="w-full flex items-center justify-between p-4 sm:px-6 bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer border-b border-slate-800/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-black text-sm flex items-center justify-center">
                          {leagueLetter}
                        </span>
                        <h3 className="text-lg font-bold text-white">{leagueKey}</h3>
                      </div>
                      {isLeagueOpen ? <span className="text-slate-400 font-bold">▲</span> : <span className="text-slate-400 font-bold">▼</span>}
                    </button>

                    {/* 2. KADEME: Gruplar */}
                    {isLeagueOpen && (
                      <div className="p-3 sm:p-5 space-y-3 bg-slate-950/30">
                        {groupsInLeague.map((groupName) => {
                          const groupFullKey = `${leagueKey} - ${groupName}`;
                          const isGroupOpen = unlOpenGroups[groupFullKey];

                          // Bu lig ve gruba ait takımları filtrele ve sırala
                          const groupTeams = tourneyStandings
                            .filter((s) => s.league === leagueKey && s.group === groupName)
                            .sort((a, b) => {
                              if (b.pts !== a.pts) return b.pts - a.pts;
                              if (b.gd !== a.gd) return b.gd - a.gd;
                              if (b.gf !== a.gf) return b.gf - a.gf;
                              if (b.win !== a.win) return b.win - a.win;
                              return a.team.localeCompare(b.team);
                            });

                          return (
                            <div key={groupFullKey} className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-md">
                              {/* Grup Başlığı */}
                              <button
                                onClick={() => toggleUnlGroup(groupFullKey)}
                                className="w-full flex items-center justify-between p-3.5 sm:px-5 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded">
                                    {leagueKey}
                                  </span>
                                  <h4 className="text-base font-bold text-slate-100">{groupName}</h4>
                                  <span className="text-xs text-slate-400">({groupTeams.length} Takım)</span>
                                </div>
                                {isGroupOpen ? <span className="text-slate-400 text-xs font-bold">▲</span> : <span className="text-slate-400 text-xs font-bold">▼</span>}
                              </button>

                              {/* 3. KADEME: Grup Puan Durumu Tablosu (Takım, O, G, B, M, A, Y, AV, P, MBPx1000) */}
                              {isGroupOpen && (
                                <div className="overflow-x-auto scrollbar-none border-t border-slate-800/60">
                                  <table className="w-full text-left text-xs sm:text-sm">
                                    <thead className="bg-slate-950/80 border-b border-slate-800/60 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                                      <tr>
                                        <th className="py-2.5 pl-4 pr-1 text-center w-10">#</th>
                                        <th className="py-2.5 px-3">{t("Takım")}</th>
                                        <th className="py-2.5 px-2 text-center font-mono w-10">O</th>
                                        <th className="py-2.5 px-2 text-center font-mono w-10">G</th>
                                        <th className="py-2.5 px-2 text-center font-mono w-10">B</th>
                                        <th className="py-2.5 px-2 text-center font-mono w-10">M</th>
                                        <th className="py-2.5 px-2 text-center font-mono w-10 hidden sm:table-cell">A</th>
                                        <th className="py-2.5 px-2 text-center font-mono w-10 hidden sm:table-cell">Y</th>
                                        <th className="py-2.5 px-2 text-center font-mono w-10 font-bold">AV</th>
                                        <th className="py-2.5 px-2 text-center font-mono text-white font-black text-sm w-12">P</th>
                                        <th className="py-2.5 pl-2 pr-4 text-center font-mono text-amber-300 font-black text-xs w-16 bg-amber-500/10">MBP</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 font-medium">
                                      {groupTeams.length === 0 ? (
                                        <tr>
                                          <td colSpan={11} className="py-6 text-center text-slate-400 text-xs">
                                            {t("Bu grupta henüz takım bulunmuyor.")}
                                          </td>
                                        </tr>
                                      ) : (
                                        groupTeams.map((team, idx) => {
                                          const rank = idx + 1;
                                          const isLeader = rank === 1;
                                          const mbp = team.ppg1000 || (team.played > 0 ? Math.round((team.pts / team.played) * 1000) : 0);

                                          return (
                                            <tr
                                              key={team.team}
                                              className={`hover:bg-slate-800/30 transition-colors ${
                                                isLeader ? "bg-indigo-950/20 border-l-2 border-l-indigo-400 text-slate-100" : "text-slate-300"
                                              }`}
                                            >
                                              <td className="py-2.5 pl-4 pr-1 text-center font-mono font-bold text-slate-400 text-xs">
                                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${isLeader ? 'bg-indigo-600/40 text-indigo-200' : 'bg-slate-900 text-slate-400'}`}>
                                                  {rank}
                                                </span>
                                              </td>
                                              <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                  {team.logo && <img src={team.logo} alt={team.team} className="w-4 h-4 object-contain" />}
                                                  <span className={`font-bold text-xs sm:text-sm ${isLeader ? 'text-white' : 'text-slate-200'}`}>
                                                    {team.team}
                                                  </span>
                                                  {team.country && (
                                                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 hidden sm:inline-block">
                                                      {team.country}
                                                    </span>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="py-2.5 px-2 text-center font-mono text-slate-300 text-xs font-bold">{team.played}</td>
                                              <td className="py-2.5 px-2 text-center font-mono text-slate-300 text-xs">{team.win}</td>
                                              <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-xs">{team.draw}</td>
                                              <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-xs">{team.lose}</td>
                                              <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-xs hidden sm:table-cell">{team.gf}</td>
                                              <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-xs hidden sm:table-cell">{team.ga}</td>
                                              <td className={`py-2.5 px-2 text-center font-mono font-bold text-xs ${
                                                team.gd > 0 ? "text-emerald-400" : team.gd < 0 ? "text-rose-400" : "text-slate-400"
                                              }`}>
                                                {team.gd > 0 ? `+${team.gd}` : team.gd}
                                              </td>
                                              <td className="py-2.5 px-2 text-center font-mono font-black text-amber-400 text-xs sm:text-sm">
                                                {team.pts}
                                              </td>
                                              <td className="py-2.5 pl-2 pr-4 text-center font-mono font-black text-amber-300 text-xs bg-amber-500/5">
                                                {mbp}
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
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
    </div>
  );
}

// ==========================================
// 🌍 ÜLKE PERFORMANS / PUAN TABLOSU (MBP - Maç Başına Puan)
// ==========================================
interface MatchTeam {
  name: string;
  countryCode: string;
  score: number | null;
}

interface MatchItem {
  id: string;
  tournament_name: string;
  tournament_api_id: number;
  status: string;
  team1: MatchTeam;
  team2: MatchTeam;
}

interface CountryStats {
  countryCode: string;
  countryName: string;
  flag: string;
  continent: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  ppg: number;
  teams: Record<string, {
    played: number;
    win: number;
    draw: number;
    loss: number;
    pts: number;
    gf: number;
    ga: number;
  }>;
}

const COUNTRY_NAMES: Record<string, { name: string; flag: string; continent: string }> = {
  // Türkçe Kodlar - Avrupa (UEFA)
  TÜR: { name: "Türkiye", flag: "🇹🇷", continent: "europe" },
  İNG: { name: "İngiltere", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", continent: "europe" },
  İSP: { name: "İspanya", flag: "🇪🇸", continent: "europe" },
  ALM: { name: "Almanya", flag: "🇩🇪", continent: "europe" },
  İTA: { name: "İtalya", flag: "🇮🇹", continent: "europe" },
  FRA: { name: "Fransa", flag: "🇫🇷", continent: "europe" },
  POR: { name: "Portekiz", flag: "🇵🇹", continent: "europe" },
  HOL: { name: "Hollanda", flag: "🇳🇱", continent: "europe" },
  BEL: { name: "Belçika", flag: "🇧🇪", continent: "europe" },
  ÇEK: { name: "Çekya", flag: "🇨🇿", continent: "europe" },
  İSV: { name: "İsviçre", flag: "🇨🇭", continent: "europe" },
  AVU: { name: "Avusturya", flag: "🇦🇹", continent: "europe" },
  İSK: { name: "İskoçya", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", continent: "europe" },
  YUN: { name: "Yunanistan", flag: "🇬🇷", continent: "europe" },
  NOR: { name: "Norveç", flag: "🇳🇴", continent: "europe" },
  DAN: { name: "Danimarka", flag: "🇩🇰", continent: "europe" },
  POL: { name: "Polonya", flag: "🇵🇱", continent: "europe" },
  HIR: { name: "Hırvatistan", flag: "🇭🇷", continent: "europe" },
  İSVE: { name: "İsveç", flag: "🇸🇪", continent: "europe" },
  KIB: { name: "Kıbrıs", flag: "🇨🇾", continent: "europe" },
  SIR: { name: "Sırbistan", flag: "🇷🇸", continent: "europe" },
  ROM: { name: "Romanya", flag: "🇷🇴", continent: "europe" },
  MAC: { name: "Macaristan", flag: "🇭🇺", continent: "europe" },
  UKR: { name: "Ukrayna", flag: "🇺🇦", continent: "europe" },
  AZE: { name: "Azerbaycan", flag: "🇦🇿", continent: "europe" },
  BUL: { name: "Bulgaristan", flag: "🇧🇬", continent: "europe" },
  SVK: { name: "Slovakya", flag: "🇸🇰", continent: "europe" },
  SVN: { name: "Slovenya", flag: "🇸🇮", continent: "europe" },
  KOS: { name: "Kosova", flag: "🇽🇰", continent: "europe" },
  KAZ: { name: "Kazakistan", flag: "🇰🇿", continent: "europe" },
  ERM: { name: "Ermenistan", flag: "🇦🇲", continent: "europe" },
  BOS: { name: "Bosna Hersek", flag: "🇧🇦", continent: "europe" },
  ARN: { name: "Arnavutluk", flag: "🇦🇱", continent: "europe" },
  GÜR: { name: "Gürcistan", flag: "🇬🇪", continent: "europe" },
  FİN: { name: "Finlandiya", flag: "🇫🇮", continent: "europe" },
  İZL: { name: "İzlanda", flag: "🇮🇸", continent: "europe" },
  İRL: { name: "İrlanda", flag: "🇮🇪", continent: "europe" },
  "K.İR": { name: "Kuzey İrlanda", flag: "🇬🇧", continent: "europe" },
  GAL: { name: "Galler", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", continent: "europe" },
  LÜK: { name: "Lüksemburg", flag: "🇱🇺", continent: "europe" },
  LİT: { name: "Litvanya", flag: "🇱🇹", continent: "europe" },
  LET: { name: "Letonya", flag: "🇱🇻", continent: "europe" },
  EST: { name: "Estonya", flag: "🇪🇪", continent: "europe" },
  MOL: { name: "Moldova", flag: "🇲🇩", continent: "europe" },
  FAR: { name: "Faroe Adaları", flag: "🇫🇴", continent: "europe" },
  MLT: { name: "Malta", flag: "🇲🇹", continent: "europe" },
  AND: { name: "Andorra", flag: "🇦🇩", continent: "europe" },
  CEB: { name: "Cebelitarık", flag: "🇬🇮", continent: "europe" },
  BLR: { name: "Belarus", flag: "🇧🇾", continent: "europe" },
  KRD: { name: "Karadağ", flag: "🇲🇪", continent: "europe" },
  "K.MK": { name: "Kuzey Makedonya", flag: "🇲🇰", continent: "europe" },
  SMR: { name: "San Marino", flag: "🇸🇲", continent: "europe" },
  İSR: { name: "İsrail", flag: "🇮🇱", continent: "europe" },

  // Amerika (CONMEBOL / CONCACAF)
  BRA: { name: "Brezilya", flag: "🇧🇷", continent: "america" },
  ARG: { name: "Arjantin", flag: "🇦🇷", continent: "america" },
  KOL: { name: "Kolombiya", flag: "🇨🇴", continent: "america" },
  ŞİL: { name: "Şili", flag: "🇨🇱", continent: "america" },
  EKV: { name: "Ekvador", flag: "🇪🇨", continent: "america" },
  URU: { name: "Uruguay", flag: "🇺🇾", continent: "america" },
  PAR: { name: "Paraguay", flag: "🇵🇾", continent: "america" },
  PER: { name: "Peru", flag: "🇵🇪", continent: "america" },
  BOL: { name: "Bolivya", flag: "🇧🇴", continent: "america" },
  VEN: { name: "Venezuela", flag: "🇻🇪", continent: "america" },
  USA: { name: "ABD", flag: "🇺🇸", continent: "america" },
  MEX: { name: "Meksika", flag: "🇲🇽", continent: "america" },
  CAN: { name: "Kanada", flag: "🇨🇦", continent: "america" },
  CRC: { name: "Kosta Rika", flag: "🇨🇷", continent: "america" },
  PAN: { name: "Panama", flag: "🇵🇦", continent: "america" },
  JAM: { name: "Jamaika", flag: "🇯🇲", continent: "america" },

  // Asya (AFC)
  JAP: { name: "Japonya", flag: "🇯🇵", continent: "asia" },
  JPN: { name: "Japonya", flag: "🇯🇵", continent: "asia" },
  KOR: { name: "Güney Kore", flag: "🇰🇷", continent: "asia" },
  KSA: { name: "Suudi Arabistan", flag: "🇸🇦", continent: "asia" },
  SAU: { name: "Suudi Arabistan", flag: "🇸🇦", continent: "asia" },
  QAT: { name: "Katar", flag: "🇶🇦", continent: "asia" },
  UAE: { name: "BAE", flag: "🇦🇪", continent: "asia" },
  IRN: { name: "İran", flag: "🇮🇷", continent: "asia" },
  AUS: { name: "Avustralya", flag: "🇦🇺", continent: "asia" },
  CHN: { name: "Çin", flag: "🇨🇳", continent: "asia" },
  UZB: { name: "Özbekistan", flag: "🇺🇿", continent: "asia" },
  IRQ: { name: "Irak", flag: "🇮🇶", continent: "asia" },
  PHI: { name: "Filipinler", flag: "🇵🇭", continent: "asia" },
  IDN: { name: "Endonezya", flag: "🇮🇩", continent: "asia" },
  THA: { name: "Tayland", flag: "🇹🇭", continent: "asia" },
  VIE: { name: "Vietnam", flag: "🇻🇳", continent: "asia" },
  MAS: { name: "Malezya", flag: "🇲🇾", continent: "asia" },
  IND: { name: "Hindistan", flag: "🇮🇳", continent: "asia" },

  // Afrika (CAF)
  MAR: { name: "Fas", flag: "🇲🇦", continent: "africa" },
  EGY: { name: "Mısır", flag: "🇪🇬", continent: "africa" },
  SEN: { name: "Senegal", flag: "🇸🇳", continent: "africa" },
  NGA: { name: "Nijerya", flag: "🇳🇬", continent: "africa" },
  ALG: { name: "Cezayir", flag: "🇩🇿", continent: "africa" },
  TUN: { name: "Tunus", flag: "🇹🇳", continent: "africa" },
  CIV: { name: "Fildişi Sahili", flag: "🇨🇮", continent: "africa" },
  CMR: { name: "Kamerun", flag: "🇨🇲", continent: "africa" },
  GHA: { name: "Gana", flag: "🇬🇭", continent: "africa" },
  MLI: { name: "Mali", flag: "🇲🇱", continent: "africa" },
  RSA: { name: "Güney Afrika", flag: "🇿🇦", continent: "africa" },
  COD: { name: "Kongo DC", flag: "🇨🇩", continent: "africa" },
  BFA: { name: "Burkina Faso", flag: "🇧🇫", continent: "africa" },
  GUI: { name: "Gine", flag: "🇬🇳", continent: "africa" },
  GAB: { name: "Gabon", flag: "🇬🇦", continent: "africa" },
  ZAM: { name: "Zambiya", flag: "🇿🇲", continent: "africa" },
  UGA: { name: "Uganda", flag: "🇺🇬", continent: "africa" },
  ANG: { name: "Angola", flag: "🇦🇴", continent: "africa" },
  NAM: { name: "Namibya", flag: "🇳🇦", continent: "africa" },
  BDI: { name: "Burundi", flag: "🇧🇮", continent: "africa" },
  SDN: { name: "Sudan", flag: "🇸🇩", continent: "africa" },
  LBY: { name: "Libya", flag: "🇱🇾", continent: "africa" },
  SSD: { name: "Güney Sudan", flag: "🇸🇸", continent: "africa" },
  TCD: { name: "Çad", flag: "🇹🇩", continent: "africa" },
  CHA: { name: "Çad", flag: "🇹🇩", continent: "africa" },
  RWA: { name: "Ruanda", flag: "🇷🇼", continent: "africa" },
  MOZ: { name: "Mozambik", flag: "🇲🇿", continent: "africa" },
  DJI: { name: "Cibuti", flag: "🇩🇯", continent: "africa" },
  NER: { name: "Nijer", flag: "🇳🇪", continent: "africa" },
  NIG: { name: "Nijer", flag: "🇳🇪", continent: "africa" },
  TOG: { name: "Togo", flag: "🇹🇬", continent: "africa" },
  MTN: { name: "Moritanya", flag: "🇲🇷", continent: "africa" },
  MRI: { name: "Mauritius", flag: "🇲🇺", continent: "africa" },
  MUS: { name: "Mauritius", flag: "🇲🇺", continent: "africa" },
  COM: { name: "Komorlar", flag: "🇰🇲", continent: "africa" },
  MAD: { name: "Madagaskar", flag: "🇲🇬", continent: "africa" },
  SLE: { name: "Sierra Leone", flag: "🇸🇱", continent: "africa" },
  EQG: { name: "Ekvator Ginesi", flag: "🇬🇶", continent: "africa" },
  GNQ: { name: "Ekvator Ginesi", flag: "🇬🇶", continent: "africa" },
  SEY: { name: "Seyşeller", flag: "🇸🇨", continent: "africa" },
  SYC: { name: "Seyşeller", flag: "🇸🇨", continent: "africa" },
  GBS: { name: "Gine-Bissau", flag: "🇬🇼", continent: "africa" },
  BOT: { name: "Botsvana", flag: "🇧🇼", continent: "africa" },
  BWA: { name: "Botsvana", flag: "🇧🇼", continent: "africa" },
  KEN: { name: "Kenya", flag: "🇰🇪", continent: "africa" },
  SWZ: { name: "Esvatini", flag: "🇸🇿", continent: "africa" },
  SOM: { name: "Somali", flag: "🇸🇴", continent: "africa" },
  TAN: { name: "Tanzanya", flag: "🇹🇿", continent: "africa" },
  TZA: { name: "Tanzanya", flag: "🇹🇿", continent: "africa" },
  LES: { name: "Lesoto", flag: "🇱🇸", continent: "africa" },
  GAM: { name: "Gambiya", flag: "🇬🇲", continent: "africa" },
  GMB: { name: "Gambiya", flag: "🇬🇲", continent: "africa" },
  MAW: { name: "Malavi", flag: "🇲🇼", continent: "africa" },
  MWI: { name: "Malavi", flag: "🇲🇼", continent: "africa" },
  ZIM: { name: "Zimbabve", flag: "🇿🇼", continent: "africa" },
  ZWE: { name: "Zimbabve", flag: "🇿🇼", continent: "africa" },
  BEN: { name: "Benin", flag: "🇧🇯", continent: "africa" },
  ETH: { name: "Etiyopya", flag: "🇪🇹", continent: "africa" },
  CPV: { name: "Yeşil Burun", flag: "🇨🇻", continent: "africa" },
  HAI: { name: "Haiti", flag: "🇭🇹", continent: "america" },

  // Uluslararası / ISO-3 & TLA Eşleşmeleri
  TUR: { name: "Türkiye", flag: "🇹🇷", continent: "europe" },
  ENG: { name: "İngiltere", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", continent: "europe" },
  ESP: { name: "İspanya", flag: "🇪🇸", continent: "europe" },
  GER: { name: "Almanya", flag: "🇩🇪", continent: "europe" },
  DEU: { name: "Almanya", flag: "🇩🇪", continent: "europe" },
  DE: { name: "Almanya", flag: "🇩🇪", continent: "europe" },
  ITA: { name: "İtalya", flag: "🇮🇹", continent: "europe" },
  PRT: { name: "Portekiz", flag: "🇵🇹", continent: "europe" },
  NED: { name: "Hollanda", flag: "🇳🇱", continent: "europe" },
  NLD: { name: "Hollanda", flag: "🇳🇱", continent: "europe" },
  CZE: { name: "Çekya", flag: "🇨🇿", continent: "europe" },
  CHE: { name: "İsviçre", flag: "🇨🇭", continent: "europe" },
  SUI: { name: "İsviçre", flag: "🇨🇭", continent: "europe" },
  AUT: { name: "Avusturya", flag: "🇦🇹", continent: "europe" },
  SCO: { name: "İskoçya", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", continent: "europe" },
  GRC: { name: "Yunanistan", flag: "🇬🇷", continent: "europe" },
  GRE: { name: "Yunanistan", flag: "🇬🇷", continent: "europe" },
  DNK: { name: "Danimarka", flag: "🇩🇰", continent: "europe" },
  DEN: { name: "Danimarka", flag: "🇩🇰", continent: "europe" },
  HRV: { name: "Hırvatistan", flag: "🇭🇷", continent: "europe" },
  CRO: { name: "Hırvatistan", flag: "🇭🇷", continent: "europe" },
  SWE: { name: "İsveç", flag: "🇸🇪", continent: "europe" },
  CYP: { name: "Kıbrıs", flag: "🇨🇾", continent: "europe" },
  SRB: { name: "Sırbistan", flag: "🇷🇸", continent: "europe" },
  ROU: { name: "Romanya", flag: "🇷🇴", continent: "europe" },
  HUN: { name: "Macaristan", flag: "🇭🇺", continent: "europe" },
  BGR: { name: "Bulgaristan", flag: "🇧🇬", continent: "europe" },
  SLO: { name: "Slovenya", flag: "🇸🇮", continent: "europe" },
  ARM: { name: "Ermenistan", flag: "🇦🇲", continent: "europe" },
  BIH: { name: "Bosna Hersek", flag: "🇧🇦", continent: "europe" },
  ALB: { name: "Arnavutluk", flag: "🇦🇱", continent: "europe" },
  GEO: { name: "Gürcistan", flag: "🇬🇪", continent: "europe" },
  FIN: { name: "Finlandiya", flag: "🇫🇮", continent: "europe" },
  ISL: { name: "İzlanda", flag: "🇮🇸", continent: "europe" },
  IRL: { name: "İrlanda", flag: "🇮🇪", continent: "europe" },
  NIR: { name: "Kuzey İrlanda", flag: "🇬🇧", continent: "europe" },
  WAL: { name: "Galler", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", continent: "europe" },
  WLS: { name: "Galler", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", continent: "europe" },
  LUX: { name: "Lüksemburg", flag: "🇱🇺", continent: "europe" },
  LTU: { name: "Litvanya", flag: "🇱🇹", continent: "europe" },
  LVA: { name: "Letonya", flag: "🇱🇻", continent: "europe" },
  MDA: { name: "Moldova", flag: "🇲🇩", continent: "europe" },
  FRO: { name: "Faroe Adaları", flag: "🇫🇴", continent: "europe" },
  GIB: { name: "Cebelitarık", flag: "🇬🇮", continent: "europe" },
  MNE: { name: "Karadağ", flag: "🇲🇪", continent: "europe" },
  MKD: { name: "Kuzey Makedonya", flag: "🇲🇰", continent: "europe" },
  ISR: { name: "İsrail", flag: "🇮🇱", continent: "europe" },
  COL: { name: "Kolombiya", flag: "🇨🇴", continent: "america" },
  CHL: { name: "Şili", flag: "🇨🇱", continent: "america" },
  ECU: { name: "Ekvador", flag: "🇪🇨", continent: "america" },
  URY: { name: "Uruguay", flag: "🇺🇾", continent: "america" },
  PRY: { name: "Paraguay", flag: "🇵🇾", continent: "america" },
};

const CONTINENT_TABS = [
  { id: "all", label: "Tümü", icon: "🌐", confederation: "Tüm Kıtalar" },
  { id: "europe", label: "Avrupa", icon: "🇪🇺", confederation: "UEFA" },
  { id: "america", label: "Amerika", icon: "🌎", confederation: "CONMEBOL / CONCACAF" },
  { id: "asia", label: "Asya", icon: "🌏", confederation: "AFC" },
  { id: "africa", label: "Afrika", icon: "🌍", confederation: "CAF" },
];

export function CupMatCountryRankings({ matches = [] }: { matches?: MatchItem[] }) {
  const { t } = useTranslation();
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [minMatchesFilter, setMinMatchesFilter] = useState<number>(1);
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");

  const countryRankings = React.useMemo(() => {
    const stats: Record<string, CountryStats> = {};

    if (!Array.isArray(matches)) return [];

    const finishedMatches = matches.filter(m => {
      if (!m || !m.team1 || !m.team2) return false;
      const isFinished = ["FT", "AET", "PEN"].includes(m.status);
      if (!isFinished) return false;
      if (tournamentFilter !== "all" && String(m.tournament_api_id || "") !== tournamentFilter) return false;
      return true;
    });

    finishedMatches.forEach(m => {
      const s1 = m.team1?.score;
      const s2 = m.team2?.score;
      if (s1 === null || s1 === undefined || s2 === null || s2 === undefined) return;

      const c1 = m.team1?.countryCode || "";
      const c2 = m.team2?.countryCode || "";
      const t1Name = m.team1?.name || "Bilinmeyen";
      const t2Name = m.team2?.name || "Bilinmeyen";

      const addTeamStats = (countryCode: string, teamName: string, myScore: number, oppScore: number) => {
        if (!countryCode || countryCode === "UNK" || countryCode === "TBD") return;

        const info = COUNTRY_NAMES[countryCode] || { name: countryCode, flag: "🌍", continent: "europe" };
        const canonicalKey = info.name || countryCode;

        if (!stats[canonicalKey]) {
          stats[canonicalKey] = {
            countryCode,
            countryName: info.name || countryCode,
            flag: info.flag || "🌍",
            continent: info.continent || "europe",
            played: 0,
            win: 0,
            draw: 0,
            loss: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            pts: 0,
            ppg: 0,
            teams: {}
          };
        }

        const c = stats[canonicalKey];
        c.played += 1;
        c.gf += myScore;
        c.ga += oppScore;
        c.gd = c.gf - c.ga;

        let matchPts = 0;
        let isWin = false;
        let isDraw = false;
        let isLoss = false;

        // Puanlar 1000 ile çarpılarak hesaplanır: Galibiyet 3.000, Beraberlik 1.000
        if (myScore > oppScore) {
          c.win += 1;
          matchPts = 3000;
          isWin = true;
        } else if (myScore === oppScore) {
          c.draw += 1;
          matchPts = 1000;
          isDraw = true;
        } else {
          c.loss += 1;
          isLoss = true;
        }

        c.pts += matchPts;
        c.ppg = c.played > 0 ? Math.round(c.pts / c.played) : 0;

        if (!c.teams[teamName]) {
          c.teams[teamName] = { played: 0, win: 0, draw: 0, loss: 0, pts: 0, gf: 0, ga: 0 };
        }
        const tStat = c.teams[teamName];
        tStat.played += 1;
        tStat.gf += myScore;
        tStat.ga += oppScore;
        if (isWin) tStat.win += 1;
        if (isDraw) tStat.draw += 1;
        if (isLoss) tStat.loss += 1;
        tStat.pts += matchPts;
      };

      addTeamStats(c1, m.team1.name, s1, s2);
      addTeamStats(c2, m.team2.name, s2, s1);
    });

    return Object.values(stats)
      .filter(c => {
        if (c.played < minMatchesFilter) return false;
        if (selectedContinent !== "all" && c.continent !== selectedContinent) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.ppg !== a.ppg) return b.ppg - a.ppg;
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });
  }, [matches, minMatchesFilter, tournamentFilter, selectedContinent]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* 🌍 1. KITA / KONFEDERASYON ALT SEKMELERİ (UEFA, CONMEBOL, AFC, CAF) */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 gap-1.5 overflow-x-auto hide-scrollbar shadow-lg">
        {CONTINENT_TABS.map((tab) => {
          const isSelected = selectedContinent === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedContinent(tab.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-400 scale-[1.02]"
                  : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{t(tab.label)}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                {tab.confederation}
              </span>
            </button>
          );
        })}
      </div>

      {/* BİLGİ KARTI */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-blue-950/70 border border-indigo-500/30 p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-4 -mr-4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">🌍</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t("Ülke Performans Sıralaması")}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {t("Maç Başına Puan")} (MBP × 1000)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kulüplerin kupalarda oynadığı tüm maçların puan ortalamasıdır (G: 3.000 P, B: 1.000 P). Çok maç yapan ülkelerin haksız avantajını engellemek için sıralama <strong>Maç Başına Kazanılan Ortalama Puan (MBP)</strong> üzerinden yapılır.
            </p>
          </div>

          {/* Filtreler */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={tournamentFilter}
              onChange={e => setTournamentFilter(e.target.value)}
              className="bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">{t("Tüm Turnuvalar")}</option>
              <option value="2">Şampiyonlar Ligi</option>
              <option value="3">Avrupa Ligi</option>
              <option value="848">Konferans Ligi</option>
              <option value="13">Copa Libertadores</option>
              <option value="11">Copa Sudamericana</option>
              <option value="17">AFC Şampiyonlar Ligi Elite</option>
              <option value="18">AFC Şampiyonlar Ligi 2</option>
              <option value="12">CAF Şampiyonlar Ligi</option>
            </select>

            <select
              value={minMatchesFilter}
              onChange={e => setMinMatchesFilter(Number(e.target.value))}
              className="bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="1">{t("Min. 1 Maç")}</option>
              <option value="2">{t("Min. 2 Maç")}</option>
              <option value="4">{t("Min. 4 Maç")}</option>
              <option value="6">{t("Min. 6 Maç")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* SIRALAMA TABLOSU */}
      <div className="bg-slate-900/50 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 text-slate-400 text-xs font-semibold border-b border-slate-800 uppercase tracking-wider">
                <th className="py-3.5 px-3 sm:px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">{t("Ülke")}</th>
                <th className="py-3.5 px-3 text-center">{t("OM")}</th>
                <th className="py-3.5 px-3 text-center text-emerald-400 font-bold">{t("G")}</th>
                <th className="py-3.5 px-3 text-center text-slate-300 font-bold">{t("B")}</th>
                <th className="py-3.5 px-3 text-center text-rose-400 font-bold">{t("M")}</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell">{t("Gol")}</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell">{t("Av.")}</th>
                <th className="py-3.5 px-3 text-center">{t("Toplam P")}</th>
                <th className="py-3.5 px-4 text-center text-indigo-400 font-black bg-indigo-950/30">
                  {t("MBP (Ort.)")}
                </th>
                <th className="py-3.5 px-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {countryRankings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    {t("Bu filtre için oynanmış maç bulunmuyor.")}
                  </td>
                </tr>
              ) : (
                countryRankings.map((c, index) => {
                  const isTop3 = index < 3;
                  const isTurkey = c.countryCode === "TÜR";
                  const isOpen = selectedCountry === c.countryCode;
                  const teamNames = Object.keys(c.teams);

                  return (
                    <React.Fragment key={c.countryCode}>
                      <tr
                        onClick={() => setSelectedCountry(isOpen ? null : c.countryCode)}
                        className={`transition-colors cursor-pointer group ${
                          isTurkey
                            ? "bg-red-950/20 hover:bg-red-950/35 border-l-4 border-l-red-500"
                            : isTop3
                            ? "bg-slate-900/30 hover:bg-slate-800/50"
                            : "hover:bg-slate-800/40"
                        }`}
                      >
                        {/* SIRA */}
                        <td className="py-3.5 px-3 sm:px-4 text-center font-black">
                          {index === 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs">🥇 1</span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 text-xs">🥈 2</span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 text-xs">🥉 3</span>
                          ) : (
                            <span className="text-slate-400">{index + 1}</span>
                          )}
                        </td>

                        {/* ÜLKE */}
                        <td className="py-3.5 px-4 font-bold text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{c.flag}</span>
                            <span className={`${isTurkey ? "text-red-300 font-black" : ""}`}>{c.countryName}</span>
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/70 px-1.5 py-0.5 rounded border border-slate-700/50">
                              {teamNames.length} {t("takım")}
                            </span>
                          </div>
                        </td>

                        {/* OM */}
                        <td className="py-3.5 px-3 text-center text-slate-300 font-semibold">{c.played}</td>
                        {/* G */}
                        <td className="py-3.5 px-3 text-center text-emerald-400 font-bold">{c.win}</td>
                        {/* B */}
                        <td className="py-3.5 px-3 text-center text-slate-400">{c.draw}</td>
                        {/* M */}
                        <td className="py-3.5 px-3 text-center text-rose-400/80">{c.loss}</td>
                        {/* GOL */}
                        <td className="py-3.5 px-3 text-center text-slate-400 text-xs hidden sm:table-cell">
                          {c.gf}:{c.ga}
                        </td>
                        {/* AV */}
                        <td className={`py-3.5 px-3 text-center text-xs font-bold hidden sm:table-cell ${
                          c.gd > 0 ? "text-emerald-400" : c.gd < 0 ? "text-rose-400" : "text-slate-400"
                        }`}>
                          {c.gd > 0 ? `+${c.gd}` : c.gd}
                        </td>
                        {/* TOPLAM PUAN (1000 İLE ÇARPILMIŞ) */}
                        <td className="py-3.5 px-3 text-center text-slate-200 font-black font-mono">
                          {c.pts.toLocaleString("tr-TR")}
                        </td>
                        {/* MAÇ BAŞINA PUAN (MBP × 1000) */}
                        <td className="py-3.5 px-4 text-center bg-indigo-950/20 font-black text-indigo-300 text-base font-mono">
                          {c.ppg.toLocaleString("tr-TR")}
                        </td>
                        {/* OK İKONU */}
                        <td className="py-3.5 px-3 text-center text-slate-500">
                          {isOpen ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                      </tr>

                      {/* TAKIM DETAYLARI (AÇILIR SATIR) */}
                      {isOpen && (
                        <tr className="bg-slate-950/60 border-y border-slate-800">
                          <td colSpan={11} className="p-4 sm:px-8">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>{c.flag} {c.countryName} {t("Kulüplerinin Katkısı")}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {teamNames.map(tName => {
                                  const tInfo = c.teams[tName];
                                  const tPpg = Math.round(tInfo.pts / tInfo.played);
                                  return (
                                    <div
                                      key={tName}
                                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                                    >
                                      <div>
                                        <h5 className="font-bold text-white text-sm">{tName}</h5>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                          {tInfo.played} {t("maç")} • {tInfo.win}G {tInfo.draw}B {tInfo.loss}M ({tInfo.gf}:{tInfo.ga})
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-black text-indigo-400 font-mono">{tInfo.pts.toLocaleString("tr-TR")} Puan</div>
                                        <div className="text-[10px] text-slate-400 font-bold font-mono">{tPpg.toLocaleString("tr-TR")} MBP</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

