"use client";

import Image from "next/image";
import { Bot, Calendar, Trophy, User } from "lucide-react";
import { useTournament } from "@/contexts/TournamentContext";
import { getTeamById, getTeamName } from "@/data/teams";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import type { KnockoutMatch, MatchPrediction, Team } from "@/lib/types/tournament";
import type { Locale } from "@/lib/i18n/types";

type KnockoutBracketProps = {
  unlocked: boolean;
};

export function KnockoutBracket({ unlocked }: KnockoutBracketProps) {
  const { knockoutBracket, predictions, setPrediction, toggleAiPredictions, aiEnabled } = useTournament();
  const { locale } = useLocale();
  const { t } = useTranslation();

  if (!unlocked) {
    return (
      <div className="grid grid-cols-2 gap-3 opacity-50 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-dashed border-white/10 bg-white/[0.02]"
          />
        ))}
      </div>
    );
  }

  // Group matches by round
  const rounds = [
    { id: "r32", title: "Son 32 Turu", matches: knockoutBracket.filter(m => m.round === "r32") },
    { id: "r16", title: "Son 16 Turu", matches: knockoutBracket.filter(m => m.round === "r16") },
    { id: "qf", title: "Çeyrek Final", matches: knockoutBracket.filter(m => m.round === "qf") },
    { id: "sf", title: "Yarı Final", matches: knockoutBracket.filter(m => m.round === "sf") },
    { id: "final", title: "Final", matches: knockoutBracket.filter(m => m.round === "final") },
  ];

  return (
    <div className="space-y-12">
      {rounds.map((round) => (
        <div key={round.id} className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              {round.title}
            </h4>
            {aiEnabled && (
              <button
                onClick={() => {
                  const matchIds = round.matches
                    .filter(m => m.homeTeamId && m.awayTeamId)
                    .map(m => m.id);
                  toggleAiPredictions(matchIds);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-violet-500/20 px-3 py-1.5 text-[10px] font-bold text-violet-300 transition hover:bg-violet-500/30"
              >
                <Bot className="h-3 w-3" />
                {t("predictions.aiRoundPredict")}
              </button>
            )}
          </div>
          
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {round.matches.map((match) => (
              <KnockoutMatchCard
                key={match.id}
                match={match}
                predictions={predictions}
                setPrediction={setPrediction}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KnockoutMatchCard({
  match,
  predictions,
  setPrediction,
  locale,
  t,
}: {
  match: KnockoutMatch;
  predictions: Record<string, MatchPrediction>;
  setPrediction: (
    matchId: string,
    home: number,
    away: number,
    et?: { home: number; away: number },
    pen?: { home: number; away: number }
  ) => void;
  locale: Locale;
  t: (key: string) => string;
}) {
  const home = match.homeTeamId ? getTeamById(match.homeTeamId) : null;
  const away = match.awayTeamId ? getTeamById(match.awayTeamId) : null;
  const pred = predictions[match.id];
  
  const isDraw = pred && pred.home === pred.away && home && away;

  return (
    <div className="relative rounded-xl border border-white/5 bg-black/40 p-4 pt-8 transition-all hover:border-emerald-500/30">
      <div className="absolute left-3 top-2 flex items-center gap-2">
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-500">
          <Calendar className="h-2.5 w-2.5" />
          {match.date}
        </span>
        {pred?.source === "ai" && (
          <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[8px] font-bold text-violet-300">YZ</span>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <TeamRow team={home} locale={locale} score={pred?.home} onChange={(v) => setPrediction(match.id, v, pred?.away ?? 0, { home: pred?.homeET ?? 0, away: pred?.awayET ?? 0 }, { home: pred?.homePen ?? 0, away: pred?.awayPen ?? 0 })} />
          <TeamRow team={away} locale={locale} score={pred?.away} onChange={(v) => setPrediction(match.id, pred?.home ?? 0, v, { home: pred?.homeET ?? 0, away: pred?.awayET ?? 0 }, { home: pred?.homePen ?? 0, away: pred?.awayPen ?? 0 })} />
        </div>

        {isDraw && (
          <div className="mt-4 space-y-3 rounded-lg bg-white/5 p-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
              <span>{t("predictions.et")}</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={pred?.homeET ?? 0}
                  onChange={(e) => setPrediction(match.id, pred.home, pred.away, { home: parseInt(e.target.value) || 0, away: pred.awayET ?? 0 }, { home: pred.homePen ?? 0, away: pred.awayPen ?? 0 })}
                  className="w-8 rounded bg-black/50 py-0.5 text-center text-white outline-none"
                />
                <input
                  type="number"
                  min={0}
                  value={pred?.awayET ?? 0}
                  onChange={(e) => setPrediction(match.id, pred.home, pred.away, { home: pred.homeET ?? 0, away: parseInt(e.target.value) || 0 }, { home: pred.homePen ?? 0, away: pred.awayPen ?? 0 })}
                  className="w-8 rounded bg-black/50 py-0.5 text-center text-white outline-none"
                />
              </div>
            </div>
            {(pred?.homeET === pred?.awayET) && (
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                <span>{t("predictions.penalties")}</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={pred?.homePen ?? 0}
                    onChange={(e) => setPrediction(match.id, pred.home, pred.away, { home: pred.homeET ?? 0, away: pred.awayET ?? 0 }, { home: parseInt(e.target.value) || 0, away: pred.awayPen ?? 0 })}
                    className="w-8 rounded bg-black/50 py-0.5 text-center text-white outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    value={pred?.awayPen ?? 0}
                    onChange={(e) => setPrediction(match.id, pred.home, pred.away, { home: pred.homeET ?? 0, away: pred.awayET ?? 0 }, { home: pred.homePen ?? 0, away: parseInt(e.target.value) || 0 })}
                    className="w-8 rounded bg-black/50 py-0.5 text-center text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamRow({ team, locale, score, onChange }: { team: Team | null | undefined, locale: Locale, score: number | undefined, onChange: (v: number) => void }) {
  if (!team) {
    return (
      <div className="flex items-center justify-between opacity-30">
        <span className="text-[10px] text-zinc-500">Belli Değil</span>
        <div className="h-7 w-10 rounded-md bg-white/5" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 overflow-hidden">
        <Image
          src={team.flagUrl}
          alt=""
          width={24}
          height={16}
          className="shrink-0 rounded object-cover"
          unoptimized
        />
        <span className="truncate text-xs font-semibold text-white">
          {getTeamName(team, locale)}
        </span>
      </div>
      <input
        type="number"
        min={0}
        value={score ?? 0}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-10 rounded-md border border-white/10 bg-black/50 py-1 text-center font-mono text-xs font-bold text-white outline-none focus:border-emerald-500/50"
      />
    </div>
  );
}
