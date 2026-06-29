"use client";

import { useMemo } from "react";
import { getTeamById } from "@/data/teams";
import { useTournament } from "@/contexts/TournamentContext";
import { useLocale } from "@/contexts/LocaleContext";
import { sortStandings } from "@/lib/standings";
import { GROUP_IDS } from "@/lib/types/tournament";
import { Trophy, CheckCircle2, XCircle } from "lucide-react";

export function ThirdPlaceStandingsTable() {
  const { locale } = useLocale();
  const { standingsByGroup } = useTournament();

  const thirdPlaceRows = useMemo(() => {
    const thirds = [];
    for (const group of GROUP_IDS) {
      const standings = standingsByGroup[group];
      // 3. siradaki takimi al (index 2)
      if (standings && standings[2]) {
        thirds.push({
          ...standings[2],
          group,
        });
      }
    }
    // FIFA kurallarina gore sirala (puan > averaj > atilan gol > teamId)
    return sortStandings(thirds).map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
  }, [standingsByGroup]);

  const dict = {
    tr: {
      title: "En İyi Üçüncüler Sıralaması",
      desc: "12 gruptan en iyi puan ve averaja sahip 8 üçüncü takım Son 32 turuna yükselir.",
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
      qualified: "Son 32'ye Yükseldi",
      eliminated: "Elendi",
      rankingRules: "Sıralama Kuralları: Puan > Averaj > Atılan Gol > Galibiyet Sayısı > Harf Sırası",
    },
    en: {
      title: "Best 3rd Place Standings",
      desc: "The 8 third-place teams with the best points and goal difference from 12 groups qualify for the Round of 32.",
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
      qualified: "Qualified to R32",
      eliminated: "Eliminated",
      rankingRules: "Ranking Rules: Points > Goal Difference > Goals Scored > Wins > Alphabetical",
    },
  }[locale === "tr" ? "tr" : "en"];

  const getFlagUrl = (teamId: string) => {
    return `https://flagcdn.com/w80/${teamId === "eng" ? "gb-eng" : teamId === "sco" ? "gb-sct" : teamId === "wal" ? "gb-wls" : teamId.substring(0, 2)}.png`.toLowerCase();
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{dict.title}</h2>
          <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{dict.desc}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-950/80 text-zinc-500 uppercase text-[10px] font-black tracking-wider">
              <th className="py-4 px-4 text-center w-[50px]">#</th>
              <th className="py-4 px-4">{dict.team}</th>
              <th className="py-4 px-4 text-center">{dict.group}</th>
              <th className="py-4 px-3 text-center">{dict.played}</th>
              <th className="py-4 px-3 text-center">{dict.won}</th>
              <th className="py-4 px-3 text-center">{dict.drawn}</th>
              <th className="py-4 px-3 text-center">{dict.lost}</th>
              <th className="py-4 px-3 text-center">{dict.goalsFor}</th>
              <th className="py-4 px-3 text-center">{dict.goalsAgainst}</th>
              <th className="py-4 px-3 text-center">{dict.goalDifference}</th>
              <th className="py-4 px-4 text-center font-extrabold text-white bg-zinc-900/40">{dict.points}</th>
              <th className="py-4 px-4 text-center">{locale === "tr" ? "Durum" : "Status"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {thirdPlaceRows.map((row) => {
              const team = getTeamById(row.teamId);
              const isQualified = row.rank <= 8;
              const flagUrl = getFlagUrl(row.teamId);

              return (
                <tr
                  key={row.teamId}
                  className={`hover:bg-zinc-900/10 transition-colors ${
                    isQualified
                      ? "bg-emerald-950/5 hover:bg-emerald-950/10"
                      : "bg-rose-950/5 hover:bg-rose-950/10"
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-zinc-400">
                    {row.rank}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={flagUrl}
                        alt=""
                        className="h-5 w-7.5 object-cover rounded shadow border border-zinc-800 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://flagcdn.com/w80/${row.teamId.substring(0, 2)}.png`.toLowerCase();
                        }}
                      />
                      <span>{locale === "tr" ? team?.nameTr : team?.nameEn}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-zinc-300 text-xs">
                    {locale === "tr" ? `Grup ${(row as any).group}` : `Group ${(row as any).group}`}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-400 text-xs">
                    {row.played}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-400 text-xs">
                    {row.won}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-400 text-xs">
                    {row.drawn}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-400 text-xs">
                    {row.lost}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-400 text-xs">
                    {row.goalsFor}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-zinc-400 text-xs">
                    {row.goalsAgainst}
                  </td>
                  <td
                    className={`py-3.5 px-3 text-center font-bold text-xs ${
                      row.goalDifference > 0
                        ? "text-emerald-400"
                        : row.goalDifference < 0
                        ? "text-rose-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-sm text-amber-400 bg-zinc-900/10">
                    {row.points}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center">
                      {isQualified ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>{dict.qualified}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                          <XCircle className="h-3 w-3 shrink-0" />
                          <span>{dict.eliminated}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-zinc-500 font-bold leading-normal italic text-center">
        ℹ️ {dict.rankingRules}
      </p>
    </div>
  );
}
