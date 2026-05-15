"use client";

import { useState } from "react";
import { GROUP_IDS, type GroupId } from "@/lib/types/tournament";
import { getMatchesForGroup } from "@/lib/fixtures";
import { getTeamById, getTeamName } from "@/data/teams";
import { useTournament } from "@/contexts/TournamentContext";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";

export function GroupMatchEditor() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { matches, updateMatchScore } = useTournament();
  const [activeGroup, setActiveGroup] = useState<GroupId>("A");

  const groupMatches = getMatchesForGroup(matches, activeGroup);

  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="mb-2 text-xl font-bold text-white">
        {t("groups.enterResults")}
      </h2>
      <p className="mb-6 text-sm text-zinc-400">{t("groups.resultsHint")}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {GROUP_IDS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              activeGroup === g
                ? "bg-emerald-500 text-[#060b14]"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <ul className="space-y-3 list-none p-0 m-0">
        {groupMatches.map((match) => {
          const home = getTeamById(match.homeTeamId);
          const away = getTeamById(match.awayTeamId);
          return (
            <li
              key={match.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-4 list-none"
            >
              <span className="text-sm font-medium text-white">
                {home ? getTeamName(home, locale) : "—"}
              </span>
              <span className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={match.homeScore ?? ""}
                  placeholder="0"
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10) || 0;
                    const a = match.awayScore ?? 0;
                    updateMatchScore(match.id, h, a);
                  }}
                  className="w-12 rounded border border-white/10 bg-black/40 py-1 text-center text-white"
                />
                <span className="text-zinc-600">-</span>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={match.awayScore ?? ""}
                  placeholder="0"
                  onChange={(e) => {
                    const a = parseInt(e.target.value, 10) || 0;
                    const h = match.homeScore ?? 0;
                    updateMatchScore(match.id, h, a);
                  }}
                  className="w-12 rounded border border-white/10 bg-black/40 py-1 text-center text-white"
                />
              </span>
              <span className="text-sm font-medium text-white">
                {away ? getTeamName(away, locale) : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
