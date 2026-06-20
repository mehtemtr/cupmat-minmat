"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getTeamById, getTeamName } from "@/data/teams";
import { useTournament } from "@/contexts/TournamentContext";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { 
  Search, 
  ArrowUpDown, 
  Trophy, 
  Sparkles,
  Flame,
  ShieldAlert
} from "lucide-react";

type SortField = "rank" | "teamName" | "groupId" | "played" | "won" | "drawn" | "lost" | "goalsFor" | "goalsAgainst" | "goalDifference" | "points";
type SortOrder = "asc" | "desc";

export function GeneralStandingsTable() {
  const router = useRouter();
  const { standingsByGroup } = useTournament();
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("points");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Flatten and prepare standings data
  const allStandings = useMemo(() => {
    return Object.entries(standingsByGroup).flatMap(([groupId, rows]) => 
      rows.map((row) => {
        const team = getTeamById(row.teamId);
        return {
          ...row,
          groupId,
          teamName: team ? getTeamName(team, locale) : "",
          fifaRank: team?.fifaRank || 999,
          confederation: team?.confederation || "",
          flagUrl: team?.flagUrl || "",
        };
      })
    );
  }, [standingsByGroup, locale]);

  // Sort and filter logic
  const processedStandings = useMemo(() => {
    // 1. First sort the teams by tournament official ranking rules to assign a "rank"
    const ranked = [...allStandings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (b.won !== a.won) return b.won - a.won;
      if (a.groupId !== b.groupId) return a.groupId.localeCompare(b.groupId);
      return a.teamId.localeCompare(b.teamId);
    }).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    // 2. Filter by search query
    const filtered = ranked.filter(item => 
      item.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.groupId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 3. Sort by the user's selected column
    if (sortField) {
      filtered.sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === "string") {
          return sortOrder === "asc" 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }

        // Numerical sorting
        if (valA !== valB) {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }

        // Secondary fallback sorting (Official Ranking)
        return a.rank - b.rank;
      });
    }

    return filtered;
  }, [allStandings, searchQuery, sortField, sortOrder]);

  // Stats Card Calculations
  const stats = useMemo(() => {
    let topScoringTeam = "";
    let topScoringFlag = "";
    let maxGoals = -1;

    let bestDefenseTeam = "";
    let bestDefenseFlag = "";
    let minGoalsAgainst = 999;
    let playedDefense = false;

    let highestPoints = -1;
    let highestPointsTeam = "";
    let highestPointsFlag = "";

    allStandings.forEach((team) => {
      // Top scorer
      if (team.goalsFor > maxGoals) {
        maxGoals = team.goalsFor;
        topScoringTeam = team.teamName;
        topScoringFlag = team.flagUrl;
      }

      // Best defense (only for teams who played at least 1 match)
      if (team.played > 0 && team.goalsAgainst < minGoalsAgainst) {
        minGoalsAgainst = team.goalsAgainst;
        bestDefenseTeam = team.teamName;
        bestDefenseFlag = team.flagUrl;
        playedDefense = true;
      }

      // Highest points
      if (team.points > highestPoints) {
        highestPoints = team.points;
        highestPointsTeam = team.teamName;
        highestPointsFlag = team.flagUrl;
      }
    });

    return {
      topScorer: maxGoals > 0 ? { team: topScoringTeam, flag: topScoringFlag, value: maxGoals } : null,
      bestDefense: playedDefense ? { team: bestDefenseTeam, flag: bestDefenseFlag, value: minGoalsAgainst } : null,
      leader: highestPoints >= 0 ? { team: highestPointsTeam, flag: highestPointsFlag, value: highestPoints } : null,
    };
  }, [allStandings]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortHeader = ({ field, label, center = false }: { field: SortField; label: string; center?: boolean }) => {
    const isActive = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        className={`px-3 py-3 cursor-pointer hover:bg-white/5 transition-all text-xs font-semibold uppercase tracking-wider text-zinc-400 select-none ${
          center ? "text-center" : "text-left"
        }`}
      >
        <div className={`inline-flex items-center gap-1 ${center ? "justify-center w-full" : ""}`}>
          <span>{label}</span>
          <ArrowUpDown className={`h-3 w-3 transition-colors ${isActive ? "text-emerald-400" : "text-zinc-600"}`} />
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Stats Cards Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Leader */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-5 backdrop-blur-md">
          <div className="absolute -right-6 -bottom-6 text-white/5">
            <Trophy className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            {locale === "tr" ? "Zirvedeki Takım" : "Top Team"}
          </div>
          {stats.leader ? (
            <div className="flex items-center gap-3">
              <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10 shrink-0">
                <Image src={stats.leader.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">{stats.leader.team}</div>
                <div className="text-xs text-emerald-400 font-extrabold">{stats.leader.value} Puan</div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-sm font-semibold">—</div>
          )}
        </div>

        {/* Top Scorer */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-5 backdrop-blur-md">
          <div className="absolute -right-6 -bottom-6 text-white/5">
            <Flame className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="h-4 w-4 text-orange-400" />
            {locale === "tr" ? "En Golcü Takım" : "Most Goals Scored"}
          </div>
          {stats.topScorer ? (
            <div className="flex items-center gap-3">
              <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10 shrink-0">
                <Image src={stats.topScorer.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">{stats.topScorer.team}</div>
                <div className="text-xs text-orange-400 font-extrabold">{stats.topScorer.value} Gol</div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-sm font-semibold">—</div>
          )}
        </div>

        {/* Best Defense */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-5 backdrop-blur-md">
          <div className="absolute -right-6 -bottom-6 text-white/5">
            <ShieldAlert className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="h-4 w-4 text-blue-400" />
            {locale === "tr" ? "En Az Gol Yiyen" : "Best Defense"}
          </div>
          {stats.bestDefense ? (
            <div className="flex items-center gap-3">
              <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10 shrink-0">
                <Image src={stats.bestDefense.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">{stats.bestDefense.team}</div>
                <div className="text-xs text-blue-400 font-extrabold">{stats.bestDefense.value} Gol Yedi</div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-sm font-semibold">—</div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === "tr" ? "Takım veya grup ara..." : "Search team or group..."}
            className="w-full rounded-xl border border-white/10 bg-zinc-950/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
        <div className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {locale === "tr" 
            ? `Toplam 48 takımdan ${processedStandings.length} tanesi gösteriliyor` 
            : `Showing ${processedStandings.length} of 48 teams`}
        </div>
      </div>

      {/* Main Standing Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm table-auto">
            <thead>
              <tr className="border-b border-white/15 bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 w-12">#</th>
                <SortHeader field="teamName" label={locale === "tr" ? "Takım" : "Team"} />
                <SortHeader field="groupId" label={locale === "tr" ? "Grup" : "Group"} center />
                <SortHeader field="played" label="O" center />
                <SortHeader field="won" label="G" center />
                <SortHeader field="drawn" label="B" center />
                <SortHeader field="lost" label="M" center />
                <SortHeader field="goalsFor" label="AG" center />
                <SortHeader field="goalsAgainst" label="YG" center />
                <SortHeader field="goalDifference" label="AV" center />
                <SortHeader field="points" label={locale === "tr" ? "Puan" : "Pts"} center />
              </tr>
            </thead>
            <tbody>
              {processedStandings.map((row, index) => {
                const rankIndex = row.rank;
                const isQualifying = rankIndex <= 32;

                return (
                  <tr 
                    key={row.teamId}
                    className={`border-b border-white/5 transition-all hover:bg-white/[0.02] ${
                      isQualifying ? "bg-emerald-500/[0.02]" : "bg-red-500/[0.01] opacity-75"
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 font-mono text-zinc-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isQualifying ? "bg-emerald-500" : "bg-zinc-700"}`} />
                        {rankIndex}
                      </div>
                    </td>

                    {/* Team Info */}
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/ulkeler/${row.teamId}`)}
                        className="flex items-center gap-3 text-left hover:text-emerald-400 transition-all group active:scale-[0.98] cursor-pointer"
                      >
                        <div className="relative h-5 w-7 shrink-0 overflow-hidden rounded ring-1 ring-white/10 group-hover:ring-emerald-500/35 transition-all">
                          <Image
                            src={row.flagUrl}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {row.teamName}
                          </span>
                          <span className="block text-[10px] text-zinc-500 font-semibold uppercase">
                            FIFA Rank: #{row.fifaRank} · {row.confederation}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Group */}
                    <td className="px-3 py-3 text-center font-bold text-zinc-300 font-mono">
                      Grup {row.groupId}
                    </td>

                    {/* Played */}
                    <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                      {row.played}
                    </td>

                    {/* Won */}
                    <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                      {row.won}
                    </td>

                    {/* Drawn */}
                    <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                      {row.drawn}
                    </td>

                    {/* Lost */}
                    <td className="px-3 py-3 text-center text-zinc-400 font-medium">
                      {row.lost}
                    </td>

                    {/* Goals For */}
                    <td className="px-3 py-3 text-center text-zinc-400 font-medium font-mono">
                      {row.goalsFor}
                    </td>

                    {/* Goals Against */}
                    <td className="px-3 py-3 text-center text-zinc-400 font-medium font-mono">
                      {row.goalsAgainst}
                    </td>

                    {/* Goal Difference */}
                    <td className="px-3 py-3 text-center font-bold font-mono">
                      <span className={row.goalDifference > 0 ? "text-emerald-400" : row.goalDifference < 0 ? "text-rose-400" : "text-zinc-500"}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="px-3 py-3 text-center font-black text-base text-emerald-400 bg-emerald-500/[0.02]">
                      {row.points}
                    </td>
                  </tr>
                );
              })}

              {processedStandings.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-zinc-500 font-semibold">
                    {locale === "tr" ? "Eşleşen takım bulunamadı." : "No matching teams found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Legend Information */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-zinc-950/20 border border-white/5 p-4 rounded-xl text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{locale === "tr" ? "Son 32 Turu Kotası (İlk 32)" : "Round of 32 Qualification (Top 32)"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span>{locale === "tr" ? "Elenenler Kotası" : "Eliminated Zone"}</span>
          </div>
        </div>
        <div className="italic text-zinc-500">
          * {locale === "tr" 
              ? "Sıralama kuralları: Puan > Averaj > Atılan Gol > Galibiyet Sayısı" 
              : "Ranking rules: Points > Goal Difference > Goals Scored > Wins"}
        </div>
      </div>

    </div>
  );
}
