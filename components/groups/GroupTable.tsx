"use client";

import Image from "next/image";
import type { GroupId } from "@/lib/types/tournament";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getTeamById, getTeamName } from "@/data/teams";
import { useGroupStandings } from "@/contexts/TournamentContext";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";

type GroupTableProps = {
  group: GroupId;
};

export function GroupTable({ group }: GroupTableProps) {
  const standings = useGroupStandings(group);
  const { locale } = useLocale();
  const { t } = useTranslation();

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <header className="border-b border-white/10 bg-emerald-500/10 px-4 py-3">
        <h3 className="font-bold text-white">
          {t("groups.group")} {group}
        </h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">{t("groups.team")}</th>
              <th className="px-2 py-2 text-center">P</th>
              <th className="px-2 py-2 text-center">W</th>
              <th className="px-2 py-2 text-center">D</th>
              <th className="px-2 py-2 text-center">L</th>
              <th className="px-2 py-2 text-center">GD</th>
              <th className="px-3 py-2 text-center font-semibold text-emerald-400">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const team = getTeamById(row.teamId);
              if (!team) return null;
              const qualifies = index < 2;
              return (
                <tr
                  key={row.teamId}
                  className={`border-b border-white/5 transition-colors ${
                    qualifies ? "bg-emerald-500/5" : ""
                  }`}
                >
                  <td className="px-3 py-0.5 font-mono text-zinc-500">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative h-5 w-7 shrink-0 overflow-hidden rounded">
                        <Image
                          src={team.flagUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="truncate font-medium text-white">
                        {getTeamName(team, locale)}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-zinc-400">
                    {row.played}
                  </td>
                  <td className="px-2 py-2 text-center text-zinc-400">
                    {row.won}
                  </td>
                  <td className="px-2 py-2 text-center text-zinc-400">
                    {row.drawn}
                  </td>
                  <td className="px-2 py-2 text-center text-zinc-400">
                    {row.lost}
                  </td>
                  <td className="px-2 py-2 text-center text-zinc-400">
                    {row.goalDifference > 0
                      ? `+${row.goalDifference}`
                      : row.goalDifference}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-white">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function AllGroupTables() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {GROUP_IDS.map((g) => (
        <GroupTable key={g} group={g} />
      ))}
    </div>
  );
}
