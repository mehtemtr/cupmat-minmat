"use client";

import Image from "next/image";
import type { GroupId } from "@/lib/types/tournament";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getTeamById, getTeamName } from "@/data/teams";
import { useGroupStandings, useTournament } from "@/contexts/TournamentContext";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type GroupTableProps = {
  group: GroupId;
};

export function GroupTable({ group }: GroupTableProps) {
  const router = useRouter();
  const standings = useGroupStandings(group);
  const { groupTableOverrides, updateGroupOrder, resetGroupOrder } = useTournament();
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [tempOrder, setTempOrder] = useState<string[]>([]);

  const rowsToRender = isEditing
    ? tempOrder.map((teamId) => {
        const row = standings.find((s) => s.teamId === teamId);
        return row || { teamId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
      })
    : standings;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <header className="border-b border-white/10 bg-emerald-500/10 px-4 py-2.5 flex items-center justify-between gap-2">
        <h3 className="font-bold text-white text-sm sm:text-base">
          {t("groups.group")} {group}
        </h3>
        <div className="flex items-center gap-1.5">
          {!isEditing ? (
            <>
              {groupTableOverrides[group] && (
                <button
                  type="button"
                  onClick={() => resetGroupOrder(group)}
                  className="rounded bg-red-500/25 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/40 active:scale-95 transition-all cursor-pointer"
                >
                  {t("groups.resetStandings")}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setTempOrder(standings.map((s) => s.teamId));
                  setIsEditing(true);
                }}
                className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/35 active:scale-95 transition-all cursor-pointer"
              >
                {t("groups.editStandings")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  updateGroupOrder(group, tempOrder);
                  setIsEditing(false);
                }}
                className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-white hover:bg-emerald-600 active:scale-95 transition-all cursor-pointer"
              >
                {t("groups.saveStandings")}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-600 active:scale-95 transition-all cursor-pointer"
              >
                {t("groups.cancelStandings")}
              </button>
            </>
          )}
        </div>
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
            {rowsToRender.map((row, index) => {
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
                      {isEditing && (
                        <div className="flex flex-col gap-0.5 justify-center mr-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextOrder = [...tempOrder];
                                const temp = nextOrder[index];
                                nextOrder[index] = nextOrder[index - 1];
                                nextOrder[index - 1] = temp;
                                setTempOrder(nextOrder);
                              }}
                              className="text-zinc-400 hover:text-emerald-400 p-0.5 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                          )}
                          {index < 3 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextOrder = [...tempOrder];
                                const temp = nextOrder[index];
                                nextOrder[index] = nextOrder[index + 1];
                                nextOrder[index + 1] = temp;
                                setTempOrder(nextOrder);
                              }}
                              className="text-zinc-400 hover:text-emerald-400 p-0.5 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={isEditing}
                        onClick={() => router.push(`/ulkeler/${team.id}`)}
                        className={`flex items-center gap-2 text-left transition-all ${
                          isEditing
                            ? "cursor-default text-zinc-300"
                            : "hover:text-emerald-400 cursor-pointer group active:scale-[0.98]"
                        }`}
                      >
                        <div className="relative h-5 w-7 shrink-0 overflow-hidden rounded ring-1 ring-white/10 group-hover:ring-emerald-500/35 transition-all">
                          <Image
                            src={team.flagUrl}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="truncate font-medium text-white group-hover:text-emerald-400 transition-colors">
                          {getTeamName(team, locale)}
                        </span>
                      </button>
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
