import { useState, useMemo } from "react";
import { GROUP_IDS, type GroupId } from "@/lib/types/tournament";
import { getMatchesForGroup } from "@/lib/fixtures";
import { getTeamById, getTeamName } from "@/data/teams";
import { useTournament } from "@/contexts/TournamentContext";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { Calendar } from "lucide-react";

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

  // Helper to determine Matchday number from match ID
  const getMatchdayNumber = (matchId: string) => {
    if (matchId.endsWith("-1") || matchId.endsWith("-6")) return 1;
    if (matchId.endsWith("-2") || matchId.endsWith("-5")) return 2;
    if (matchId.endsWith("-3") || matchId.endsWith("-4")) return 3;
    return 1;
  };

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
                  ? "bg-emerald-500 text-[#060b14] shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <ul className="space-y-4 list-none p-0 m-0">
          {groupMatches.map((match) => {
            const home = getTeamById(match.homeTeamId);
            const away = getTeamById(match.awayTeamId);
            const matchday = getMatchdayNumber(match.id);
            return (
              <li
                key={match.id}
                className="flex flex-col gap-2.5 rounded-2xl border border-white/5 bg-zinc-950/40 p-4 hover:bg-zinc-900/30 hover:border-zinc-700/50 transition-all duration-300 shadow-md"
              >
                {/* Match Info Header */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-b border-white/5 pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-bold text-zinc-300">
                      Matchday {matchday}
                    </span>
                    {match.isLive && (
                      <span className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 font-bold text-red-500 animate-pulse border border-red-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        LIVE
                      </span>
                    )}
                    {match.played && !match.isLive && (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-400 border border-emerald-500/20">
                        FINISHED
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {match.date} &bull; {match.time}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
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
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
