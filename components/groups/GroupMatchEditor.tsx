import { useState, useMemo } from "react";
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

  const groupMatches = useMemo(() => {
    const rawMatches = getMatchesForGroup(matches, activeGroup);
    return [...rawMatches].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time || "00:00"}:00Z`;
      const dateTimeB = `${b.date}T${b.time || "00:00"}:00Z`;
      return new Date(dateTimeA).getTime() - new Date(dateTimeB).getTime();
    });
  }, [matches, activeGroup]);

  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-[#060b14]/40 p-6 backdrop-blur-md shadow-2xl">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-center mb-2 text-xl font-bold text-white">
          {t("groups.enterResults")}
        </h2>
        <p className="text-center mb-6 text-sm text-zinc-400">{t("groups.resultsHint")}</p>

        <div className="mb-6 flex flex-wrap justify-center gap-1.5">
          {GROUP_IDS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveGroup(g)}
              className={`rounded-xl px-3.5 py-1.5 text-sm font-black transition-all ${
                activeGroup === g
                  ? "bg-emerald-500 text-[#060b14] shadow-lg shadow-emerald-500/20 active:scale-95"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <ul className="space-y-3.5 list-none p-0 m-0">
          {groupMatches.map((match) => {
            const home = getTeamById(match.homeTeamId);
            const away = getTeamById(match.awayTeamId);
            return (
              <li
                key={match.id}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-white/5 bg-zinc-950/40 p-4 hover:bg-zinc-900/30 hover:border-zinc-700/50 transition-all duration-300 shadow-md"
              >
                {/* Home Team */}
                <div className="flex items-center justify-end gap-3 flex-1 text-right min-w-0">
                  <span className="text-sm font-extrabold text-white truncate">
                    {home ? getTeamName(home, locale) : "—"}
                  </span>
                  {home?.flagUrl && (
                    <div className="relative w-8 h-6 shrink-0 overflow-hidden rounded shadow border border-white/10 bg-zinc-900">
                      <img
                        src={home.flagUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Score inputs */}
                <div className="flex items-center gap-2.5 justify-center shrink-0">
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
                    className="w-12 h-9 rounded-xl border border-white/10 bg-black/40 text-center text-white font-extrabold focus:border-emerald-500/50 outline-none transition-all placeholder-zinc-700"
                  />
                  <span className="text-zinc-600 font-bold">-</span>
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
                    className="w-12 h-9 rounded-xl border border-white/10 bg-black/40 text-center text-white font-extrabold focus:border-emerald-500/50 outline-none transition-all placeholder-zinc-700"
                  />
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-start gap-3 flex-1 text-left min-w-0">
                  {away?.flagUrl && (
                    <div className="relative w-8 h-6 shrink-0 overflow-hidden rounded shadow border border-white/10 bg-zinc-900">
                      <img
                        src={away.flagUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm font-extrabold text-white truncate">
                    {away ? getTeamName(away, locale) : "—"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
