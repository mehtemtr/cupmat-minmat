"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getTeamById, getTeamName } from "@/data/teams";
import { useTournament } from "@/contexts/TournamentContext";
import { useLocale } from "@/contexts/LocaleContext";
import { 
  Search, 
  ArrowUpDown, 
  Trophy, 
  Sparkles,
  Flame,
  ShieldAlert
} from "lucide-react";

export const standingsTranslations = {
  tr: {
    title: "Genel Puan Durumu",
    groupTables: "Grup Tabloları",
    team: "Takım",
    group: "Grup",
    played: "O",
    won: "G",
    drawn: "B",
    lost: "M",
    goalsFor: "AG",
    goalsAgainst: "YG",
    goalDifference: "AV",
    points: "Puan",
    topTeam: "Zirvedeki Takım",
    mostGoals: "En Golcü Takım",
    bestDefense: "En Az Gol Yiyen",
    goals: "Gol",
    conceded: "Gol Yedi",
    searchPlaceholder: "Takım veya grup ara...",
    showingText: (showing: number, total: number) => `Toplam ${total} takımdan ${showing} tanesi gösteriliyor`,
    r32Quota: "Son 32 Turu Kotası (İlk 32)",
    eliminatedZone: "Elenenler Kotası",
    rankingRules: "Sıralama kuralları: Puan > Averaj > Atılan Gol > Galibiyet Sayısı > Harf Sırası",
    noMatching: "Eşleşen takım bulunamadı.",
    fifaRank: "FIFA Sıralaması"
  },
  en: {
    title: "General Standings",
    groupTables: "Group Tables",
    team: "Team",
    group: "Group",
    played: "P",
    won: "W",
    drawn: "D",
    lost: "L",
    goalsFor: "GF",
    goalsAgainst: "GA",
    goalDifference: "GD",
    points: "Pts",
    topTeam: "Top Team",
    mostGoals: "Most Goals Scored",
    bestDefense: "Best Defense",
    goals: "Goals",
    conceded: "Goals Conceded",
    searchPlaceholder: "Search team or group...",
    showingText: (showing: number, total: number) => `Showing ${showing} of ${total} teams`,
    r32Quota: "Round of 32 Qualification (Top 32)",
    eliminatedZone: "Eliminated Zone",
    rankingRules: "Ranking rules: Points > Goal Difference > Goals Scored > Wins > Alphabetical",
    noMatching: "No matching teams found.",
    fifaRank: "FIFA Rank"
  },
  es: {
    title: "Clasificación General",
    groupTables: "Tablas de Grupos",
    team: "Equipo",
    group: "Grupo",
    played: "PJ",
    won: "PG",
    drawn: "PE",
    lost: "PP",
    goalsFor: "GF",
    goalsAgainst: "GC",
    goalDifference: "DG",
    points: "Pts",
    topTeam: "Mejor Equipo",
    mostGoals: "Más Goles Marcados",
    bestDefense: "Mejor Defensa",
    goals: "Goles",
    conceded: "Goles Concedidos",
    searchPlaceholder: "Buscar equipo o grupo...",
    showingText: (showing: number, total: number) => `Mostrando ${showing} de ${total} equipos`,
    r32Quota: "Clasificación a Dieciseisavos (Top 32)",
    eliminatedZone: "Zona de Eliminación",
    rankingRules: "Criterios: Puntos > Diferencia de Goles > Goles Marcados > Victorias > Alfabeto",
    noMatching: "No se encontraron equipos.",
    fifaRank: "Ranking FIFA"
  },
  fr: {
    title: "Classement Général",
    groupTables: "Tableaux des Groupes",
    team: "Équipe",
    group: "Groupe",
    played: "MJ",
    won: "G",
    drawn: "N",
    lost: "P",
    goalsFor: "BP",
    goalsAgainst: "BC",
    goalDifference: "DB",
    points: "Pts",
    topTeam: "Meilleure Équipe",
    mostGoals: "Plus de Buts Marqués",
    bestDefense: "Meilleure Défense",
    goals: "Buts",
    conceded: "Buts Encaissés",
    searchPlaceholder: "Rechercher une équipe ou un groupe...",
    showingText: (showing: number, total: number) => `Affichage de ${showing} sur ${total} équipes`,
    r32Quota: "Qualification Seizièmes (Top 32)",
    eliminatedZone: "Zone d'Élimination",
    rankingRules: "Critères: Points > Différence de Buts > Buts Marqués > Victoires > Alphabétique",
    noMatching: "Aucune équipe trouvée.",
    fifaRank: "Classement FIFA"
  },
  de: {
    title: "Gesamttabelle",
    groupTables: "Gruppentabellen",
    team: "Team",
    group: "Gruppe",
    played: "Sp",
    won: "S",
    drawn: "U",
    lost: "N",
    goalsFor: "T",
    goalsAgainst: "GT",
    goalDifference: "TD",
    points: "Pkt",
    topTeam: "Spitzenteam",
    mostGoals: "Meiste Tore",
    bestDefense: "Beste Abwehr",
    goals: "Tore",
    conceded: "Gegentore",
    searchPlaceholder: "Team oder Gruppe suchen...",
    showingText: (showing: number, total: number) => `Zeige ${showing} von ${total} Teams`,
    r32Quota: "Runde der 32 Qualifikation (Top 32)",
    eliminatedZone: "Ausscheidungszone",
    rankingRules: "Kriterien: Punkte > Tordifferenz > Erzielte Tore > Siege > Alphabetisch",
    noMatching: "Keine Teams gefunden.",
    fifaRank: "FIFA-Rang"
  },
  pt: {
    title: "Classificação Geral",
    groupTables: "Tabelas de Grupos",
    team: "Equipa",
    group: "Grupo",
    played: "J",
    won: "V",
    drawn: "E",
    lost: "D",
    goalsFor: "GM",
    goalsAgainst: "GS",
    goalDifference: "DG",
    points: "Pts",
    topTeam: "Melhor Equipa",
    mostGoals: "Mais Golos Marcados",
    bestDefense: "Melhor Defesa",
    goals: "Golos",
    conceded: "Golos Sofridos",
    searchPlaceholder: "Pesquisar equipa ou grupo...",
    showingText: (showing: number, total: number) => `Mostrando ${showing} de ${total} equipas`,
    r32Quota: "Qualificação Dezasseis-avos (Top 32)",
    eliminatedZone: "Zona de Eliminação",
    rankingRules: "Critérios: Pontos > Diferença de Golos > Golos Marcados > Vitórias > Alfabético",
    noMatching: "Nenhuma equipa encontrada.",
    fifaRank: "Ranking FIFA"
  },
  it: {
    title: "Classifica Generale",
    groupTables: "Tabelle dei Gruppi",
    team: "Squadra",
    group: "Gruppo",
    played: "G",
    won: "V",
    drawn: "N",
    lost: "P",
    goalsFor: "GF",
    goalsAgainst: "GS",
    goalDifference: "DR",
    points: "Pt",
    topTeam: "Miglior Squadra",
    mostGoals: "Maggior Numero di Gol",
    bestDefense: "Miglior Difesa",
    goals: "Gol",
    conceded: "Gol Subiti",
    searchPlaceholder: "Cerca squadra o gruppo...",
    showingText: (showing: number, total: number) => `Mostrate ${showing} di ${total} squadre`,
    r32Quota: "Qualificazione Sedicesimi (Top 32)",
    eliminatedZone: "Zona Eliminazione",
    rankingRules: "Criteri: Punti > Differenza Reti > Gol Fatti > Vittorie > Alfabetico",
    noMatching: "Nessuna squadra trovata.",
    fifaRank: "Ranking FIFA"
  },
  ko: {
    title: "종합 순위표",
    groupTables: "조별 리그 순위표",
    team: "팀",
    group: "조",
    played: "경기",
    won: "승",
    drawn: "무",
    lost: "패",
    goalsFor: "득점",
    goalsAgainst: "실점",
    goalDifference: "득실차",
    points: "승점",
    topTeam: "선두 팀",
    mostGoals: "최다 득점 팀",
    bestDefense: "최소 실점 팀",
    goals: "골",
    conceded: "실점",
    searchPlaceholder: "팀 또는 조 검색...",
    showingText: (showing: number, total: number) => `총 ${total}개 팀 중 ${showing}개 팀 표시 중`,
    r32Quota: "32강 토너먼트 진출권 (상위 32개 팀)",
    eliminatedZone: "탈락 영역",
    rankingRules: "순위 결정 기준: 승점 > 득실차 > 다득점 > 승리 횟수 > 가나다순",
    noMatching: "일치하는 팀이 없습니다.",
    fifaRank: "FIFA 랭킹"
  },
  ar: {
    title: "الترتيب العام",
    groupTables: "جداول المجموعات",
    team: "الفريق",
    group: "المجموعة",
    played: "لعب",
    won: "فوز",
    drawn: "تعادل",
    lost: "خسارة",
    goalsFor: "له",
    goalsAgainst: "عليه",
    goalDifference: "الفارق",
    points: "نقاط",
    topTeam: "الفريق الأفضل",
    mostGoals: "الأكثر تسجيلاً",
    bestDefense: "أفضل دفاع",
    goals: "أهداف",
    conceded: "استقبل",
    searchPlaceholder: "ابحث عن فريق أو مجموعة...",
    showingText: (showing: number, total: number) => `عرض ${showing} من أصل ${total} فرق`,
    r32Quota: "تأهل دور الـ 32 (أول 32 فريقاً)",
    eliminatedZone: "منطقة الإقصاء",
    rankingRules: "قواعد الترتيب: النقاط > فارق الأهداف > الأهداف المسجلة > الانتصارات > الترتيب الأبجدي",
    noMatching: "لم يتم العثور على فرق مطابقة.",
    fifaRank: "تصنيف الفيفا"
  }
};

type SortField = "rank" | "teamName" | "groupId" | "played" | "won" | "drawn" | "lost" | "goalsFor" | "goalsAgainst" | "goalDifference" | "points";
type SortOrder = "asc" | "desc";

export function GeneralStandingsTable() {
  const router = useRouter();
  const { standingsByGroup, knockoutBracket } = useTournament();
  const { locale } = useLocale();

  const currentLang = (locale in standingsTranslations ? locale : "en") as keyof typeof standingsTranslations;
  const labels = standingsTranslations[currentLang];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("points");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Flatten and prepare standings data with knockout stages included
  const allStandings = useMemo(() => {
    // 1. Group stage rows
    const groupRows = Object.entries(standingsByGroup).flatMap(([groupId, rows]) => 
      rows.map((row) => ({
        ...row,
        groupId,
      }))
    );

    // Map by team ID for easy accumulation
    const teamStandingsMap: Record<string, {
      teamId: string;
      groupId: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
    }> = {};

    groupRows.forEach((row) => {
      teamStandingsMap[row.teamId] = {
        teamId: row.teamId,
        groupId: row.groupId,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
      };
    });

    // 2. Add knockout matches results if played/predicted
    if (knockoutBracket && Array.isArray(knockoutBracket)) {
      knockoutBracket.forEach((match) => {
        const { homeTeamId, awayTeamId, homeScore, awayScore, homeET, awayET, played } = match;
        if (!homeTeamId || !awayTeamId) return;

        // Check if there is a played or predicted result
        const isPlayed = played || (homeScore !== null && awayScore !== null);
        if (!isPlayed || homeScore === null || awayScore === null) return;

        const homeRow = teamStandingsMap[homeTeamId];
        const awayRow = teamStandingsMap[awayTeamId];

        if (homeRow && awayRow) {
          const hGoals = homeScore + (homeET ?? 0);
          const aGoals = awayScore + (awayET ?? 0);

          homeRow.played += 1;
          awayRow.played += 1;

          homeRow.goalsFor += hGoals;
          homeRow.goalsAgainst += aGoals;
          awayRow.goalsFor += aGoals;
          awayRow.goalsAgainst += hGoals;

          if (hGoals > aGoals) {
            homeRow.won += 1;
            homeRow.points += 3;
            awayRow.lost += 1;
          } else if (hGoals < aGoals) {
            awayRow.won += 1;
            awayRow.points += 3;
            homeRow.lost += 1;
          } else {
            homeRow.drawn += 1;
            homeRow.points += 1;
            awayRow.drawn += 1;
            awayRow.points += 1;
          }

          homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
          awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;
        }
      });
    }

    return Object.values(teamStandingsMap).map((row) => {
      const team = getTeamById(row.teamId);
      return {
        ...row,
        teamName: team ? getTeamName(team, locale) : "",
        fifaRank: team?.fifaRank || 999,
        confederation: team?.confederation || "",
        flagUrl: team?.flagUrl || "",
      };
    });
  }, [standingsByGroup, knockoutBracket, locale]);

  // Sort and filter logic
  const processedStandings = useMemo(() => {
    // 1. First sort the teams by tournament official ranking rules to assign a "rank"
    // Cezayir (Algeria) will naturally be ranked above Türkiye because we fall back to teamName alphabetical order!
    const ranked = [...allStandings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (b.won !== a.won) return b.won - a.won;
      return a.teamName.localeCompare(b.teamName, currentLang);
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
            ? valA.localeCompare(valB, currentLang) 
            : valB.localeCompare(valA, currentLang);
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
  }, [allStandings, searchQuery, sortField, sortOrder, currentLang]);

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
            {labels.topTeam}
          </div>
          {stats.leader ? (
            <div className="flex items-center gap-3">
              <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10 shrink-0">
                <Image src={stats.leader.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">{stats.leader.team}</div>
                <div className="text-xs text-emerald-400 font-extrabold">{stats.leader.value} {labels.points}</div>
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
            {labels.mostGoals}
          </div>
          {stats.topScorer ? (
            <div className="flex items-center gap-3">
              <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10 shrink-0">
                <Image src={stats.topScorer.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">{stats.topScorer.team}</div>
                <div className="text-xs text-orange-400 font-extrabold">{stats.topScorer.value} {labels.goals}</div>
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
            {labels.bestDefense}
          </div>
          {stats.bestDefense ? (
            <div className="flex items-center gap-3">
              <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10 shrink-0">
                <Image src={stats.bestDefense.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              <div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">{stats.bestDefense.team}</div>
                <div className="text-xs text-blue-400 font-extrabold">{stats.bestDefense.value} {labels.goals}</div>
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
            placeholder={labels.searchPlaceholder}
            className="w-full rounded-xl border border-white/10 bg-zinc-950/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
        <div className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {labels.showingText(processedStandings.length, 48)}
        </div>
      </div>

      {/* Main Standing Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm table-auto">
            <thead>
              <tr className="border-b border-white/15 bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 w-12">#</th>
                <SortHeader field="teamName" label={labels.team} />
                <SortHeader field="groupId" label={labels.group} center />
                <SortHeader field="played" label={labels.played} center />
                <SortHeader field="won" label={labels.won} center />
                <SortHeader field="drawn" label={labels.drawn} center />
                <SortHeader field="lost" label={labels.lost} center />
                <SortHeader field="goalsFor" label={labels.goalsFor} center />
                <SortHeader field="goalsAgainst" label={labels.goalsAgainst} center />
                <SortHeader field="goalDifference" label={labels.goalDifference} center />
                <SortHeader field="points" label={labels.points} center />
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
                            {labels.fifaRank}: #{row.fifaRank} · {row.confederation}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Group */}
                    <td className="px-3 py-3 text-center font-bold text-zinc-300 font-mono">
                      {labels.group} {row.groupId}
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
                    {labels.noMatching}
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
            <span>{labels.r32Quota}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span>{labels.eliminatedZone}</span>
          </div>
        </div>
        <div className="italic text-zinc-500">
          * {labels.rankingRules}
        </div>
      </div>

    </div>
  );
}
