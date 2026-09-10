"use client";

import React, { useState, useEffect } from "react";
import { Trophy, RefreshCw, Shield, Award, CheckCircle2, Flame, Globe } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

interface StandingTeam {
  rank?: number;
  team: string;
  teamId?: number;
  logo?: string;
  country?: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form?: string;
  league?: string;
  group?: string;
}

const TOURNAMENTS = [
  {
    id: 2,
    name: "Şampiyonlar Ligi",
    shortName: "UCL",
    icon: "🏆",
    badgeColor: "from-blue-600 via-indigo-600 to-cyan-500",
    borderColor: "border-blue-500/40",
    activeColor: "bg-blue-600/30 text-blue-300 border-blue-400 shadow-blue-500/20",
    description: "36 Takımlı Lig Aşaması — İlk 8 Doğrudan Son 16, 9-24 Play-off",
    isLeagueStage: true,
  },
  {
    id: 3,
    name: "Avrupa Ligi",
    shortName: "UEL",
    icon: "🟠",
    badgeColor: "from-orange-600 via-amber-600 to-yellow-500",
    borderColor: "border-orange-500/40",
    activeColor: "bg-orange-600/30 text-orange-300 border-orange-400 shadow-orange-500/20",
    description: "36 Takımlı Lig Aşaması — İlk 8 Doğrudan Son 16, 9-24 Play-off",
    isLeagueStage: true,
  },
  {
    id: 848,
    name: "Konferans Ligi",
    shortName: "UECL",
    icon: "🟢",
    badgeColor: "from-emerald-600 via-teal-600 to-green-500",
    borderColor: "border-emerald-500/40",
    activeColor: "bg-emerald-600/30 text-emerald-300 border-emerald-400 shadow-emerald-500/20",
    description: "36 Takımlı Lig Aşaması — İlk 8 Doğrudan Son 16, 9-24 Play-off",
    isLeagueStage: true,
  },
  {
    id: 5,
    name: "Uluslar Ligi",
    shortName: "UNL",
    icon: "🌍",
    badgeColor: "from-purple-600 via-pink-600 to-red-500",
    borderColor: "border-purple-500/40",
    activeColor: "bg-purple-600/30 text-purple-300 border-purple-400 shadow-purple-500/20",
    description: "A, B, C ve D Ligleri — 4'erli ve 3'erli Grup Formatı",
    isLeagueStage: false,
  },
];

export function CupMatStandings() {
  const { t } = useTranslation();
  const [selectedTournament, setSelectedTournament] = useState<number>(2);
  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  const fetchStandings = async (tourneyId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cupmat/standings?tournament=${tourneyId}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.standings)) {
          setStandings(data.standings);
          setIsLive(data.isLive || false);
        }
      }
    } catch (err) {
      console.error("Failed to load standings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings(selectedTournament);
  }, [selectedTournament]);

  const currentTourney = TOURNAMENTS.find((t) => t.id === selectedTournament) || TOURNAMENTS[0];

  return (
    <div className="w-full space-y-6 select-none animate-fadeIn">
      {/* 4 Cup Selection Tabs Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 hide-scrollbar">
          {TOURNAMENTS.map((tourney) => {
            const isSelected = selectedTournament === tourney.id;
            return (
              <button
                key={tourney.id}
                onClick={() => setSelectedTournament(tourney.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer border whitespace-nowrap ${
                  isSelected
                    ? `${tourney.activeColor} border scale-102 shadow-lg ring-1 ring-white/20`
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-slate-700"
                }`}
              >
                <span className="text-base">{tourney.icon}</span>
                <span>{tourney.name}</span>
              </button>
            );
          })}
        </div>

        {/* Refresh button & status */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"}`} />
            <span>{currentTourney.isLeagueStage ? "36 Takımlı Lig Formatı" : "Milli Takımlar Formatı"}</span>
          </div>

          <button
            onClick={() => fetchStandings(selectedTournament)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Puan Tablosunu Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tournament Description Sub-Header */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <span className="font-semibold">{currentTourney.description}</span>
        <span className="font-mono text-slate-500">
          {currentTourney.isLeagueStage ? "Toplam 36 Takım" : "Avrupa Uluslar Ligi"}
        </span>
      </div>

      {/* Standings Table Container (36-Team League Mode vs UNL 3-Level Drilldown Mode) */}
      {currentTourney.isLeagueStage ? (
        <div className="bg-[#0b1121]/90 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                <tr>
                  <th className="py-3.5 pl-4 sm:pl-6 pr-2 text-center w-12 sm:w-14">#</th>
                  <th className="py-3.5 px-2 sm:px-4">Takım</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono">O</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">G</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">B</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden xs:table-cell">M</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden md:table-cell">A</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono hidden md:table-cell">Y</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 sm:w-12 font-mono font-bold">AV</th>
                  <th className="py-3.5 pl-2 pr-4 sm:pr-6 text-center w-12 sm:w-16 font-mono text-white font-black text-sm">P</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                        <span className="text-xs font-bold text-slate-400">Puan durumu yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : standings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
                          ⚽
                        </div>
                        <span className="font-extrabold text-white text-sm sm:text-base">Puan Tablosu Güncelleniyor</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  standings.map((team, idx) => {
                    const rank = team.rank || idx + 1;
                    const isDirect16 = rank <= 8;
                    const isPlayoff = rank >= 9 && rank <= 24;

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
                        <td className="py-3 pl-2 pr-4 sm:pr-6 text-center font-mono font-black text-amber-400 text-sm sm:text-base">
                          {team.pts}
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
                <span className="font-bold text-emerald-300">1 - 8: Son 16 Turu (Doğrudan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400" />
                <span className="font-bold text-amber-300">9 - 24: Play-off Turu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600" />
                <span className="font-bold text-slate-400">25 - 36: Elendi</span>
              </div>
            </div>
            <div className="text-slate-500 italic text-[11px]">UEFA 36 Takımlı Yeni Lig Sistemi</div>
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
                      const groupTeams = standings
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

                          {/* 3. KADEME: Grup Puan Durumu Tablosu (Takım, O, G, B, M, A, Y, AV, P) */}
                          {isGroupOpen && (
                            <div className="overflow-x-auto scrollbar-none border-t border-slate-800/60">
                              <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-950/80 border-b border-slate-800/60 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                                  <tr>
                                    <th className="py-2.5 pl-4 pr-1 text-center w-10">#</th>
                                    <th className="py-2.5 px-3">Takım</th>
                                    <th className="py-2.5 px-2 text-center font-mono w-10">O</th>
                                    <th className="py-2.5 px-2 text-center font-mono w-10">G</th>
                                    <th className="py-2.5 px-2 text-center font-mono w-10">B</th>
                                    <th className="py-2.5 px-2 text-center font-mono w-10">M</th>
                                    <th className="py-2.5 px-2 text-center font-mono w-10 hidden sm:table-cell">A</th>
                                    <th className="py-2.5 px-2 text-center font-mono w-10 hidden sm:table-cell">Y</th>
                                    <th className="py-2.5 px-2 text-center font-mono w-10 font-bold">AV</th>
                                    <th className="py-2.5 pl-2 pr-4 text-center font-mono text-white font-black text-sm w-12">P</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 font-medium">
                                  {groupTeams.length === 0 ? (
                                    <tr>
                                      <td colSpan={10} className="py-6 text-center text-slate-400 text-xs">
                                        Bu grupta henüz takım bulunmuyor.
                                      </td>
                                    </tr>
                                  ) : (
                                    groupTeams.map((team, idx) => {
                                      const rank = idx + 1;
                                      const isLeader = rank === 1;

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
                                          <td className="py-2.5 pl-2 pr-4 text-center font-mono font-black text-amber-400 text-xs sm:text-sm">
                                            {team.pts}
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

const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  TÜR: { name: "Türkiye", flag: "🇹🇷" },
  İNG: { name: "İngiltere", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  İSP: { name: "İspanya", flag: "🇪🇸" },
  ALM: { name: "Almanya", flag: "🇩🇪" },
  İTA: { name: "İtalya", flag: "🇮🇹" },
  FRA: { name: "Fransa", flag: "🇫🇷" },
  POR: { name: "Portekiz", flag: "🇵🇹" },
  HOL: { name: "Hollanda", flag: "🇳🇱" },
  BEL: { name: "Belçika", flag: "🇧🇪" },
  ÇEK: { name: "Çekya", flag: "🇨🇿" },
  İSV: { name: "İsviçre", flag: "🇨🇭" },
  AVU: { name: "Avusturya", flag: "🇦🇹" },
  İSK: { name: "İskoçya", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  YUN: { name: "Yunanistan", flag: "🇬🇷" },
  NOR: { name: "Norveç", flag: "🇳🇴" },
  DAN: { name: "Danimarka", flag: "🇩🇰" },
  POL: { name: "Polonya", flag: "🇵🇱" },
  HIR: { name: "Hırvatistan", flag: "🇭🇷" },
  İSVE: { name: "İsveç", flag: "🇸🇪" },
  KIB: { name: "Kıbrıs", flag: "🇨🇾" },
  SIR: { name: "Sırbistan", flag: "🇷🇸" },
  ROM: { name: "Romanya", flag: "🇷🇴" },
  MAC: { name: "Macaristan", flag: "🇭🇺" },
  UKR: { name: "Ukrayna", flag: "🇺🇦" },
  AZE: { name: "Azerbaycan", flag: "🇦🇿" },
  BUL: { name: "Bulgaristan", flag: "🇧🇬" },
  SVK: { name: "Slovakya", flag: "🇸🇰" },
  SVN: { name: "Slovenya", flag: "🇸🇮" },
  KOS: { name: "Kosova", flag: "🇽🇰" },
  KAZ: { name: "Kazakistan", flag: "🇰🇿" },
  ERM: { name: "Ermenistan", flag: "🇦🇲" },
  BOS: { name: "Bosna Hersek", flag: "🇧🇦" },
  ARN: { name: "Arnavutluk", flag: "🇦🇱" },
  GÜR: { name: "Gürcistan", flag: "🇬🇪" },
  FİN: { name: "Finlandiya", flag: "🇫🇮" },
  İZL: { name: "İzlanda", flag: "🇮🇸" },
  İRL: { name: "İrlanda", flag: "🇮🇪" },
  "K.İR": { name: "Kuzey İrlanda", flag: "🇬🇧" },
  GAL: { name: "Galler", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  LÜK: { name: "Lüksemburg", flag: "🇱🇺" },
  LİT: { name: "Litvanya", flag: "🇱🇹" },
  LET: { name: "Letonya", flag: "🇱🇻" },
  EST: { name: "Estonya", flag: "🇪🇪" },
  MOL: { name: "Moldova", flag: "🇲🇩" },
  FAR: { name: "Faroe Adaları", flag: "🇫🇴" },
  MLT: { name: "Malta", flag: "🇲🇹" },
  AND: { name: "Andorra", flag: "🇦🇩" },
  CEB: { name: "Cebelitarık", flag: "🇬🇮" },
  BLR: { name: "Belarus", flag: "🇧🇾" },
  KRD: { name: "Karadağ", flag: "🇲🇪" },
  "K.MK": { name: "Kuzey Makedonya", flag: "🇲🇰" },
  SMR: { name: "San Marino", flag: "🇸🇲" },
  İSR: { name: "İsrail", flag: "🇮🇱" },
  BRA: { name: "Brezilya", flag: "🇧🇷" },
  ARG: { name: "Arjantin", flag: "🇦🇷" },
  KOL: { name: "Kolombiya", flag: "🇨🇴" },
  ŞİL: { name: "Şili", flag: "🇨🇱" },
  EKV: { name: "Ekvador", flag: "🇪🇨" },
  URU: { name: "Uruguay", flag: "🇺🇾" },
  PAR: { name: "Paraguay", flag: "🇵🇾" },
  PER: { name: "Peru", flag: "🇵🇪" },
  BOL: { name: "Bolivya", flag: "🇧🇴" },
  VEN: { name: "Venezuela", flag: "🇻🇪" },
};

export function CupMatCountryRankings({ matches = [] }: { matches?: MatchItem[] }) {
  const { t } = useTranslation();
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

        if (!stats[countryCode]) {
          const info = COUNTRY_NAMES[countryCode] || { name: countryCode, flag: "🌍" };
          stats[countryCode] = {
            countryCode,
            countryName: info.name || countryCode,
            flag: info.flag || "🌍",
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

        const c = stats[countryCode];
        c.played += 1;
        c.gf += myScore;
        c.ga += oppScore;
        c.gd = c.gf - c.ga;

        let matchPts = 0;
        let isWin = false;
        let isDraw = false;
        let isLoss = false;

        if (myScore > oppScore) {
          c.win += 1;
          matchPts = 3;
          isWin = true;
        } else if (myScore === oppScore) {
          c.draw += 1;
          matchPts = 1;
          isDraw = true;
        } else {
          c.loss += 1;
          isLoss = true;
        }

        c.pts += matchPts;
        c.ppg = c.played > 0 ? Number((c.pts / c.played).toFixed(2)) : 0;

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
      .filter(c => c.played >= minMatchesFilter)
      .sort((a, b) => {
        if (b.ppg !== a.ppg) return b.ppg - a.ppg;
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });
  }, [matches, minMatchesFilter, tournamentFilter]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* BILGI KARTI */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-blue-950/70 border border-indigo-500/30 p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-4 -mr-4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">🌍</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t("Ülke Performans Sıralaması")}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {t("Maç Başına Puan")} (MBP)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kulüplerin kupalarda oynadığı tüm maçların puan ortalamasıdır (G: 3P, B: 1P). Çok maç yapan ülkelerin haksız avantajını engellemek için sıralama <strong>Maç Başına Kazanılan Ortalama Puan (MBP)</strong> üzerinden yapılır.
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
                        {/* TOPLAM PUAN */}
                        <td className="py-3.5 px-3 text-center text-slate-200 font-bold">{c.pts}</td>
                        {/* MAÇ BAŞINA PUAN (MBP) */}
                        <td className="py-3.5 px-4 text-center bg-indigo-950/20 font-black text-indigo-300 text-base">
                          {c.ppg.toFixed(2)}
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
                                  const tPpg = (tInfo.pts / tInfo.played).toFixed(2);
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
                                        <div className="text-sm font-black text-indigo-400">{tInfo.pts} Puan</div>
                                        <div className="text-[10px] text-slate-400 font-semibold">{tPpg} MBP</div>
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

