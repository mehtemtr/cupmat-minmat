"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  Trophy,
  Activity,
  User,
  RotateCcw,
  Calendar,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getMatchesForGroup } from "@/lib/fixtures";
import { getTeamById, getTeamName } from "@/data/teams";
import { useTournament } from "@/contexts/TournamentContext";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { KnockoutBracket } from "@/components/predictions/KnockoutBracket";
import { LeaderboardPanel } from "@/components/predictions/LeaderboardPanel";

export function PredictionWizard() {
  const { t } = useTranslation();
  const {
    matches,
    predictions,
    setPrediction,
    resetPredictions,
    applyPredictionsToMatches,
    toggleAiPredictions,
    simulateRandomLiveNews,
    aiEnabled,
    aiAnalyses,
    knockoutUnlocked,
    knockoutBracket,
    displayName,
    setDisplayName,
    submitToLeaderboard,
    predictionPoints,
  } = useTournament();

  const [step, setStep] = useState(0);
  const currentGroup = GROUP_IDS[step];

  const groupMatches = useMemo(
    () => getMatchesForGroup(matches, currentGroup),
    [matches, currentGroup],
  );

  const allPredicted = GROUP_IDS.every((g) =>
    getMatchesForGroup(matches, g).every((m) => predictions[m.id]),
  );

  const isFinalComplete = useMemo(() => {
    const final = knockoutBracket.find(m => m.round === "final");
    return final && predictions[final.id];
  }, [knockoutBracket, predictions]);

  const winnerTeamId = useMemo(() => {
    if (!isFinalComplete) return null;
    const final = knockoutBracket.find(m => m.round === "final")!;
    const p = predictions[final.id];
    if (p.home > p.away) return final.homeTeamId;
    if (p.away > p.home) return final.awayTeamId;
    return final.homeTeamId; // fallback
  }, [isFinalComplete, knockoutBracket, predictions]);

  const { locale } = useLocale();

  useEffect(() => {
    if (winnerTeamId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [winnerTeamId]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Champion Announcement */}
        {winnerTeamId && (
          <div className="animate-bounce rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-1 shadow-2xl shadow-amber-500/20">
            <div className="flex flex-col items-center justify-center rounded-[calc(1rem-1px)] bg-[#060b14] py-8 text-center">
              <Trophy className="mb-4 h-16 w-16 text-amber-400" />
              <h2 className="mb-2 text-3xl font-black tracking-tighter text-white">
                🏆 {t("predictions.champion")}: {getTeamName(getTeamById(winnerTeamId)!, locale).toUpperCase()}
              </h2>
              <p className="text-amber-200/60">{t("predictions.completed")}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => toggleAiPredictions()}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                aiEnabled
                  ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-violet-400/30"
              }`}
            >
              <Bot className="h-4 w-4" />
              {t("predictions.aiToggle")}
            </button>
            
            <button
              type="button"
              onClick={() => resetPredictions()}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              {t("predictions.reset")}
            </button>

            {aiEnabled && (
              <button
                type="button"
                onClick={() => simulateRandomLiveNews(currentGroup)}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
              >
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                {t("predictions.simulateLive")}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Trophy className="h-4 w-4 text-amber-400" />
            {t("predictions.yourPoints")}:{" "}
            <span className="font-bold text-white">{predictionPoints}</span>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {GROUP_IDS.map((g, i) => (
            <button
              key={g}
              type="button"
              onClick={() => setStep(i)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                step === i
                  ? "bg-emerald-500 text-[#060b14]"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        </div>

        {/* MinMat Promo Banner */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Brain className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white">MinMat Zeka Oyunları</h4>
                <p className="text-sm text-blue-200/60">
                  Sizin ve çocuklarınızın hafızadan hesap yapmasını kolaylaştıracak zeka oyunu!
                </p>
              </div>
            </div>
            <Link
              href="/minmat/index.html"
              className="shrink-0 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-400"
            >
              Şimdi Dene
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="mb-6 text-lg font-bold text-white">
            {t("predictions.groupStep")} {currentGroup}
          </h3>
          <div className="space-y-4">
            {groupMatches.map((match) => {
              const pred = predictions[match.id];
              const analysis = aiAnalyses?.find((a) => a.matchId === match.id);
              const isPast = new Date(match.date) < new Date();
              const isLocked = match.played || isPast;

              return (
                <div
                  key={match.id}
                  className={`relative rounded-xl border border-white/5 bg-black/20 p-4 pt-8 transition ${isLocked ? "opacity-60" : ""}`}
                >
                  <div className="absolute left-4 top-2 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                      <Calendar className="h-3 w-3" />
                      {match.date} {isPast && t("predictions.played")}
                    </span>
                    {pred?.source === "ai" && (
                      <span className="flex items-center gap-1 rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                        <Bot className="h-2.5 w-2.5" />
                        {t("predictions.aiLabel")}
                      </span>
                    )}
                    {pred?.source === "user" && (
                      <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        <User className="h-2.5 w-2.5" />
                        {t("predictions.userLabel")}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                    <TeamLabel teamId={match.homeTeamId} />
                    <div className="flex items-center gap-2">
                      <ScoreInput
                        value={pred?.home ?? 0}
                        disabled={isLocked}
                        onChange={(v) =>
                          setPrediction(match.id, v, pred?.away ?? 0)
                        }
                      />
                      <span className="text-zinc-600">:</span>
                      <ScoreInput
                        value={pred?.away ?? 0}
                        disabled={isLocked}
                        onChange={(v) =>
                          setPrediction(match.id, pred?.home ?? 0, v)
                        }
                      />
                    </div>
                    <TeamLabel teamId={match.awayTeamId} />
                  </div>
                  {aiEnabled && analysis && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-violet-500/20 bg-violet-500/5">
                      {analysis.isLiveUpdate && (
                        <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                          </span>
                          {t("predictions.liveUpdate")}
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs leading-relaxed text-violet-200">
                          {analysis.summary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("predictions.prev")}
            </button>
            <button
              type="button"
              disabled={step === GROUP_IDS.length - 1}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#060b14] disabled:opacity-40"
            >
              {t("predictions.next")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <label className="mb-2 block text-sm text-zinc-400">
            {t("predictions.displayName")}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white outline-none focus:border-emerald-400/50"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => applyPredictionsToMatches()}
            disabled={!allPredicted}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-[#060b14] disabled:opacity-40"
          >
            {t("predictions.applyScores")}
          </button>
          <button
            type="button"
            onClick={() => submitToLeaderboard()}
            className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5"
          >
            {t("predictions.submitLeaderboard")}
          </button>
        </div>

        <div
          className={`rounded-2xl border p-6 transition ${
            knockoutUnlocked
              ? "border-emerald-400/30 bg-emerald-500/5"
              : "border-white/10 bg-white/[0.02] opacity-80"
          }`}
        >
          <div className="mb-4 flex items-center gap-2">
            {knockoutUnlocked ? (
              <Trophy className="h-5 w-5 text-emerald-400" />
            ) : (
              <Lock className="h-5 w-5 text-zinc-500" />
            )}
            <h3 className="font-bold text-white">
              {t("predictions.knockoutTitle")}
            </h3>
          </div>
          {!knockoutUnlocked && (
            <p className="mb-4 text-sm text-zinc-500">
              {t("predictions.knockoutLocked")}
            </p>
          )}
          <KnockoutBracket unlocked={knockoutUnlocked} />
        </div>

        {/* Future Proofing: Coming Soon Section */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { key: "players", label: t("hero.players") },
            { key: "countries", label: t("hero.countries") },
            { key: "referees", label: t("hero.referees") }
          ].map((item) => (
            <div
              key={item.key}
              className="group relative cursor-not-allowed rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600">{t("hero.comingSoon")}</span>
                <Lock className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              <h5 className="font-semibold text-zinc-500">{item.label}</h5>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-1/3 bg-emerald-500/20 transition-all group-hover:w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <LeaderboardPanel />
    </div>
  );
}

function TeamLabel({ teamId }: { teamId: string }) {
  const { locale } = useLocale();
  const team = getTeamById(teamId);
  if (!team) return null;
  return (
    <div className="flex min-w-[120px] flex-col items-center gap-2">
      <div className="relative h-8 w-12 overflow-hidden rounded">
        <Image src={team.flagUrl} alt="" fill className="object-cover" unoptimized />
      </div>
      <span className="text-center text-xs font-medium text-white">
        {getTeamName(team, locale)}
      </span>
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      max={15}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      className="w-14 rounded-lg border border-white/10 bg-black/40 py-2 text-center font-mono text-lg font-bold text-white outline-none focus:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}
