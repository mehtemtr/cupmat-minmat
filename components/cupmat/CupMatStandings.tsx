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
  const [activeUnlLeague, setActiveUnlLeague] = useState<string>("A Ligi");

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

  // For UNL, group by League & Group
  const unlLeagues = ["A Ligi", "B Ligi", "C Ligi", "D Ligi"];
  const filteredUnl = standings.filter((s) => s.league === activeUnlLeague);
  const unlGroupsMap = filteredUnl.reduce((acc, team) => {
    const grp = team.group || "Grup 1";
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(team);
    return acc;
  }, {} as Record<string, StandingTeam[]>);

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

      {/* UNL Sub-league Navigation Pills */}
      {selectedTournament === 5 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {unlLeagues.map((lg) => (
            <button
              key={lg}
              onClick={() => setActiveUnlLeague(lg)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeUnlLeague === lg
                  ? "bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {lg}
            </button>
          ))}
        </div>
      )}

      {/* Tournament Description Sub-Header */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <span className="font-semibold">{currentTourney.description}</span>
        <span className="font-mono text-slate-500">
          {currentTourney.isLeagueStage ? "Toplam 36 Takım" : `${activeUnlLeague}`}
        </span>
      </div>

      {/* Standings Table Container (36-Team League Mode vs UNL Group Mode) */}
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
        /* UNL Group Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(unlGroupsMap).map(([groupName, groupTeams]) => (
            <div key={groupName} className="bg-[#0b1121]/90 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <h4 className="font-black text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  {activeUnlLeague} — {groupName}
                </h4>
              </div>

              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/50 border-b border-slate-800/60 text-[10px] uppercase text-slate-400 font-bold">
                    <tr>
                      <th className="py-2.5 pl-4 pr-1 text-center w-8">#</th>
                      <th className="py-2.5 px-2">Takım</th>
                      <th className="py-2.5 px-1.5 text-center font-mono">O</th>
                      <th className="py-2.5 px-1.5 text-center font-mono">G</th>
                      <th className="py-2.5 px-1.5 text-center font-mono">B</th>
                      <th className="py-2.5 px-1.5 text-center font-mono">M</th>
                      <th className="py-2.5 px-1.5 text-center font-mono font-bold">AV</th>
                      <th className="py-2.5 pr-4 text-center font-mono text-white font-black">P</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {groupTeams.map((team, idx) => {
                      const rank = idx + 1;
                      const isLeader = rank === 1;
                      return (
                        <tr
                          key={team.team}
                          className={`hover:bg-slate-800/30 transition-colors ${
                            isLeader ? "bg-purple-950/20 border-l-2 border-l-purple-400" : ""
                          }`}
                        >
                          <td className="py-2 pl-4 pr-1 text-center font-mono font-bold text-slate-400 text-xs">{rank}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {team.logo && <img src={team.logo} alt={team.team} className="w-4 h-4 object-contain" />}
                              <span className="font-bold text-slate-200 text-xs truncate max-w-[120px] sm:max-w-[150px]">{team.team}</span>
                            </div>
                          </td>
                          <td className="py-2 px-1.5 text-center font-mono text-slate-300 text-xs">{team.played}</td>
                          <td className="py-2 px-1.5 text-center font-mono text-slate-300 text-xs">{team.win}</td>
                          <td className="py-2 px-1.5 text-center font-mono text-slate-400 text-xs">{team.draw}</td>
                          <td className="py-2 px-1.5 text-center font-mono text-slate-400 text-xs">{team.lose}</td>
                          <td className="py-2 px-1.5 text-center font-mono font-bold text-slate-300 text-xs">{team.gd}</td>
                          <td className="py-2 pr-4 text-center font-mono font-black text-amber-400 text-xs sm:text-sm">{team.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

