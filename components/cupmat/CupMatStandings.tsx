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

