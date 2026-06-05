"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Trophy, ShieldAlert, Award, Calendar, Timer, User, Gift } from "lucide-react";
import type { UserActivity, GecmisSampiyon, RewardEntry } from "@/lib/store/gamification-store";
import { useTranslation } from "@/contexts/LocaleContext";

const getOverallMaxLevel = (minmatMaxLevels?: { add: number; sub: number; mul: number; div: number; mix: number }) => {
  if (!minmatMaxLevels) return 1;
  const values = Object.values(minmatMaxLevels);
  return values.length > 0 ? Math.max(...values) : 1;
};

const getMinMatBadge = (maxLevel: number, locale: string) => {
  if (maxLevel >= 25) {
    return {
      name: locale === "tr" ? "💎 Zeka Efsanesi" : "💎 Math Legend",
      colorClass: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-400/30",
    };
  }
  if (maxLevel >= 20) {
    return {
      name: locale === "tr" ? "🥇 Sayıların Efendisi" : "🥇 Lord of Numbers",
      colorClass: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-400/30 font-bold",
    };
  }
  if (maxLevel >= 15) {
    return {
      name: locale === "tr" ? "🥈 Zihin Ustası" : "🥈 Mind Master",
      colorClass: "bg-gradient-to-r from-zinc-300 to-zinc-400 text-black border-zinc-300/30 font-bold",
    };
  }
  if (maxLevel >= 10) {
    return {
      name: locale === "tr" ? "🥉 Matematik Savaşçısı" : "🥉 Math Warrior",
      colorClass: "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600/30",
    };
  }
  return null;
};

export default function LeaderboardPage() {
  const { t, locale } = useTranslation();
  const { user, isSignedIn, isLoaded } = useUser();
  const [leaderboard, setLeaderboard] = useState<UserActivity[]>([]);
  const [gecmisSampiyonlar, setGecmisSampiyonlar] = useState<GecmisSampiyon[]>([]);
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [myProfile, setMyProfile] = useState<UserActivity | null>(null);
  const [cupMatRewards, setCupMatRewards] = useState<RewardEntry[]>([]);
  const [minMatRewards, setMinMatRewards] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const badgeEarners = useMemo(() => {
    return leaderboard
      .map((row) => {
        const maxLvl = getOverallMaxLevel(row.minmatMaxLevels);
        const badge = getMinMatBadge(maxLvl, locale);
        return {
          ...row,
          maxLvl,
          badge,
        };
      })
      .filter((entry) => entry.badge !== null)
      .sort((a, b) => b.maxLvl - a.maxLvl);
  }, [leaderboard, locale]);

  // Fetch Leaderboard & Profile Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "/api/gamification";
        if (isLoaded && isSignedIn && user) {
          const name = user.fullName || user.username || "Oyuncu";
          url += `?userId=${user.id}&displayName=${encodeURIComponent(name)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          const sortedData = (data.leaderboard || []).sort((a: any, b: any) => (b.taraftarPuani || 0) - (a.taraftarPuani || 0));
          setLeaderboard(sortedData);
          setGecmisSampiyonlar(data.gecmisSampiyonlar || []);
          setPeriodEnd(data.periodEnd || "");
          setCupMatRewards(data.cupMatPodium72h || []);
          setMinMatRewards(data.minMatPodium72h || []);
          if (data.profile) {
            setMyProfile(data.profile);
          }
        }
      } catch (err) {
        console.error("Fetch leaderboard data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, user]);

  // Countdown timer for 3-day reset period
  useEffect(() => {
    if (!periodEnd) return;

    const updateTimer = () => {
      const difference = new Date(periodEnd).getTime() - Date.now();
      setTimeLeft(difference <= 0 ? 0 : difference);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [periodEnd]);

  // Format countdown text based on remaining time
  const formatCountdown = () => {
    if (timeLeft === null) return t("gamification.calculating");
    if (timeLeft <= 0) return t("gamification.resetting");

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${days} ${t("countdown.days")} ${hours} ${t("countdown.hours")} ${minutes} ${t("countdown.minutes")} ${seconds} ${t("countdown.seconds")}`;
  };

  // Localize dynamic game modes
  const getLocalizedMode = (mode?: string) => {
    if (!mode) return "";
    const key = mode.toLowerCase();
    if (key === "toplama" || key === "topla" || key === "add") return t("gamification.modes.add");
    if (key === "çıkarma" || key === "cikar" || key === "sub") return t("gamification.modes.sub");
    if (key === "çarpma" || key === "carp" || key === "mul") return t("gamification.modes.mul");
    if (key === "bölme" || key === "bol" || key === "div") return t("gamification.modes.div");
    if (key === "karışık" || key === "karisik" || key === "mix") return t("gamification.modes.mix");
    return mode;
  };

  // Get translated reward text based on rank index
  const getCupMatRewardText = (rank: number) => {
    if (rank === 1) return t("gamification.rewards.cupMat.rank1");
    if (rank === 2) return t("gamification.rewards.cupMat.rank2");
    if (rank === 3) return t("gamification.rewards.cupMat.rank3");
    return "";
  };

  const getMinMatRewardText = (rank: number) => {
    if (rank === 1) return t("gamification.rewards.minMat.rank1");
    if (rank === 2) return t("gamification.rewards.minMat.rank2");
    if (rank === 3) return t("gamification.rewards.minMat.rank3");
    return "";
  };

  // Calculate my rank in current leaderboard
  const myRank =
    isSignedIn && user
      ? leaderboard.findIndex((item) => item.userId === user.id) + 1
      : 0;

  const isUserInTop10 = myRank > 0 && myRank <= 10;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="relative mb-12 text-center">
        <div className="absolute inset-x-0 -top-8 -z-10 flex justify-center">
          <div className="h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Timer className="h-3.5 w-3.5" /> {t("gamification.raceBadge")}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {t("gamification.leaderboardTitle").split(" ")[0]}{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            {t("gamification.leaderboardTitle").split(" ").slice(1).join(" ")}
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-zinc-400">
          {t("gamification.leaderboardDesc")}
        </p>

        {/* Dynamic Countdown Banner */}
        {periodEnd && (
          <div className="mx-auto mt-6 inline-flex max-w-md items-center gap-2.5 rounded-xl border border-white/10 bg-[#060b14]/60 px-4 py-2.5 shadow-xl backdrop-blur-sm">
            <Timer className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400">{t("gamification.resettingRemaining")}</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">{formatCountdown()}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Active Leaderboard Table (Top 10) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#060b14]/50 p-6 shadow-xl backdrop-blur-md">
              <h2 className="mb-6 flex items-center gap-2.5 text-lg font-bold text-white sm:text-xl">
                <Trophy className="h-5.5 w-5.5 text-yellow-400" />
                {t("predictions.leaderboard")} (Top 10)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 pb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <th className="py-3 px-4">{t("gamification.rank")}</th>
                      <th className="py-3 px-4">{t("gamification.username")}</th>
                      <th className="py-3 px-4 text-right">{t("gamification.totalPoints")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboard.slice(0, 10).map((row, index) => {
                      const rank = index + 1;
                      const isCurrentUser = row.userId === user?.id;

                      return (
                        <tr
                          key={row.userId}
                          className={`group transition-all hover:bg-white/5 ${
                            isCurrentUser
                              ? "bg-emerald-500/10 text-emerald-300 font-bold"
                              : "text-zinc-300"
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                                rank === 1
                                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/25"
                                  : rank === 2
                                  ? "bg-zinc-300 text-black shadow-md shadow-zinc-300/25"
                                  : rank === 3
                                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
                                  : "border border-white/10 bg-white/5 text-zinc-400"
                              }`}
                            >
                              {rank}
                            </span>
                          </td>
                           <td className="py-3.5 px-4">
                            <span className="flex flex-wrap items-center gap-2">
                              {isCurrentUser && (
                                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                                  {t("gamification.you")}
                                </span>
                              )}
                              <span className="truncate max-w-[120px] sm:max-w-none font-semibold text-white">
                                {row.displayName}
                              </span>
                              {(() => {
                                const maxLvl = getOverallMaxLevel(row.minmatMaxLevels);
                                const badge = getMinMatBadge(maxLvl, locale);
                                if (!badge) return null;
                                return (
                                  <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-extrabold shadow-sm ${badge.colorClass}`}>
                                    {badge.name}
                                  </span>
                                );
                              })()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black font-mono text-white text-sm sm:text-base">
                            {row.taraftarPuani ?? 0} <span className="text-[10px] text-zinc-500 font-normal">{t("gamification.points")}</span>
                          </td>
                        </tr>
                      );
                    })}

                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-sm text-zinc-500">
                          {t("gamification.noParticipants")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* If user is not in top 10, show sticky card below */}
            {isSignedIn && !isUserInTop10 && myProfile && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t("gamification.yourStatus")}</h4>
                      <p className="text-xs text-emerald-400/80">{t("gamification.joinMugadele")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-400">{t("gamification.yourRank")}</div>
                    <div className="text-sm sm:text-base font-extrabold text-white font-mono">
                      {myRank > 0 ? t("gamification.rankValue").replace("{rank}", String(myRank)) : t("gamification.outOfRank")}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      {t("gamification.yourPointsColon")} <span className="font-bold text-emerald-400">{myProfile.mevcutPeriyotPuani}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* If user is guest */}
            {!isSignedIn && (
              <div className="rounded-xl border border-white/10 bg-[#060b14]/30 p-5 text-center shadow-lg">
                <p className="text-sm text-zinc-400 mb-3">
                  {t("gamification.guestPrompt")}
                </p>
                <SignInButton mode="redirect" forceRedirectUrl="/leaderboard">
                  <button className="rounded-lg bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-bold text-[#060b14] hover:bg-emerald-400 transition-colors">
                    {t("gamification.loginNow")}
                  </button>
                </SignInButton>
              </div>
            )}
          </div>

          {/* Sidebar: Reward Tables + Past Champions */}
          <div className="space-y-6">

            {/* CupMat Ödül Sıralaması */}
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-[#060b14]/50 p-6 shadow-xl backdrop-blur-md">
              <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-white sm:text-xl">
                <Gift className="h-5 w-5 text-amber-400" />
                {t("gamification.cupMatRewardsTitle")}
              </h2>
              <p className="mb-4 text-xs text-zinc-400">
                {t("gamification.cupMatRewardsDesc")}
              </p>
              {cupMatRewards.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">
                  {t("gamification.noEligibleUsers")}
                </div>
              ) : (
                <div className="space-y-2">
                  {cupMatRewards.map((entry) => (
                    <div
                      key={entry.displayName}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                        entry.rank <= 3
                          ? "border border-amber-500/20 bg-amber-500/10"
                          : "border border-white/5 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          entry.rank === 1 ? "bg-yellow-400 text-black" :
                          entry.rank === 2 ? "bg-zinc-300 text-black" :
                          entry.rank === 3 ? "bg-amber-600 text-white" :
                          "bg-white/10 text-zinc-500"
                        }`}>
                          {entry.rank}
                        </span>
                        <span className="font-medium text-zinc-200 truncate max-w-[100px]">{entry.displayName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-white">{entry.score} <span className="text-zinc-500 font-normal">P</span></div>
                        {entry.rank <= 3 && (
                          <div className="text-[10px] text-amber-400 mt-0.5">{getCupMatRewardText(entry.rank)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MinMat Ödül Sıralaması */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-[#060b14]/50 p-6 shadow-xl backdrop-blur-md">
              <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-white sm:text-xl">
                <Gift className="h-5 w-5 text-purple-400" />
                {t("gamification.minMatRewardsTitle")}
              </h2>
              <p className="mb-4 text-xs text-zinc-400">
                {t("gamification.minMatRewardsDesc")}
              </p>
              {minMatRewards.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">
                  {t("gamification.noEligibleUsers")}
                </div>
              ) : (
                <div className="space-y-2">
                  {minMatRewards.map((entry) => (
                    <div
                      key={entry.displayName}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                        entry.rank <= 3
                          ? "border border-purple-500/20 bg-purple-500/10"
                          : "border border-white/5 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          entry.rank === 1 ? "bg-yellow-400 text-black" :
                          entry.rank === 2 ? "bg-zinc-300 text-black" :
                          entry.rank === 3 ? "bg-amber-600 text-white" :
                          "bg-white/10 text-zinc-500"
                        }`}>
                          {entry.rank}
                        </span>
                        <span className="font-medium text-zinc-200 truncate max-w-[100px]">{entry.displayName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-white">{entry.score} <span className="text-zinc-500 font-normal">P</span></div>
                        {(entry.level != null || entry.mode) && (
                          <div className="text-[10px] text-purple-300/90 mt-0.5">
                            Lv.{entry.level ?? 1}
                            {entry.mode ? ` • ${getLocalizedMode(entry.mode)}` : ""}
                          </div>
                        )}
                        {entry.rank <= 3 && (
                          <div className="text-[10px] text-purple-400 mt-0.5">{getMinMatRewardText(entry.rank)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MinMat Rozet Kürsüsü (Badge Hall of Fame) */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-[#060b14]/50 p-6 shadow-xl backdrop-blur-md">
              <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-white sm:text-xl">
                <Award className="h-5 w-5 text-cyan-400" />
                {locale === "tr" ? "MinMat Rozet Kürsüsü" : "MinMat Badge Hall of Fame"}
              </h2>
              <p className="mb-4 text-xs text-zinc-400">
                {locale === "tr"
                  ? "Zeka oyununda Seviye 10 ve üzerine ulaşıp rozet kazanan kahramanlar:"
                  : "Heroes who reached Level 10 and above in the brain game and earned badges:"}
              </p>
              {badgeEarners.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">
                  {locale === "tr" ? "Henüz rozet kazanan oyuncu bulunmuyor." : "No players have earned badges yet."}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {badgeEarners.map((entry) => (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm border border-white/5 bg-zinc-950/40"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-zinc-200 truncate max-w-[100px]">{entry.displayName}</span>
                        {entry.userId === user?.id && (
                          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">
                            {t("gamification.you")}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold shadow-sm ${entry.badge!.colorClass}`}>
                          {entry.badge!.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Max Lvl: {entry.maxLvl}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Champions Section (Vitrin / Şeref Kürsüsü) */}
            <div className="rounded-2xl border border-white/10 bg-[#060b14]/50 p-6 shadow-xl backdrop-blur-md">
              <h2 className="mb-6 flex items-center gap-2.5 text-lg font-bold text-white sm:text-xl">
                <Award className="h-5.5 w-5.5 text-emerald-400" />
                {t("gamification.pastChampions")}
              </h2>

              <div className="space-y-4">
                {gecmisSampiyonlar.length === 0 ? (
                  <div className="text-center py-8 text-sm text-zinc-500">
                    <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                    {t("gamification.noPastChampions")}
                  </div>
                ) : (
                  // Group by Date
                  Object.entries(
                    gecmisSampiyonlar.reduce((groups, item) => {
                      const dateLocale = locale === "en" ? "en-US" : locale;
                      const date = new Date(item.periyotBitisTarihi).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "long",
                      });
                      if (!groups[date]) groups[date] = [];
                      groups[date].push(item);
                      return groups;
                    }, {} as Record<string, GecmisSampiyon[]>)
                  ).map(([date, champs]) => (
                    <div
                      key={date}
                      className="rounded-xl border border-white/5 bg-white/5 p-4 transition hover:border-white/10"
                    >
                      <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-2 text-xs font-semibold text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{t("gamification.periodResultsTitle").replace("{date}", date)}</span>
                      </div>

                      <div className="space-y-2">
                        {champs
                          .sort((a, b) => a.derece - b.derece)
                          .filter((c) => c.derece >= 1 && c.derece <= 3)
                          .slice(0, 3)
                          .map((champ) => (
                            <div key={champ.userId} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-base">
                                  {champ.derece === 1 ? "🥇" : champ.derece === 2 ? "🥈" : "🥉"}
                                </span>
                                <span className="font-medium text-zinc-200">
                                  {champ.displayName}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-zinc-500 font-mono">
                                {t("gamification.placeValue").replace("{rank}", String(champ.derece))}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
