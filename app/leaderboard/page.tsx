"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Trophy, ShieldAlert, Award, Calendar, Timer, User, Gift } from "lucide-react";
import type { UserActivity, GecmisSampiyon, RewardEntry } from "@/lib/store/gamification-store";

export default function LeaderboardPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [leaderboard, setLeaderboard] = useState<UserActivity[]>([]);
  const [gecmisSampiyonlar, setGecmisSampiyonlar] = useState<GecmisSampiyon[]>([]);
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("");
  const [myProfile, setMyProfile] = useState<UserActivity | null>(null);
  const [cupMatRewards, setCupMatRewards] = useState<RewardEntry[]>([]);
  const [minMatRewards, setMinMatRewards] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
          setCupMatRewards(data.cupMatRewards || []);
          setMinMatRewards(data.minMatRewards || []);
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
      if (difference <= 0) {
        setCountdown("Sıfırlanıyor...");
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown(`${days} Gün ${hours} Saat ${minutes} Dakika ${seconds} Saniye`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [periodEnd]);

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
          <Timer className="h-3.5 w-3.5" /> 3 Günlük Periyot Yarışı
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Taraftar <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Liderlik Tablosu</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-zinc-400">
          Sitede gezinerek topladığınız Taraftar Puanları ile Tahmin Puanlarınızın (10x katı) toplamından oluşan 3 günlük heyecan dolu periyot yarışı!
        </p>

        {/* Dynamic Countdown Banner */}
        {periodEnd && (
          <div className="mx-auto mt-6 inline-flex max-w-md items-center gap-2.5 rounded-xl border border-white/10 bg-[#060b14]/60 px-4 py-2.5 shadow-xl backdrop-blur-sm">
            <Timer className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400">Sıfırlanmaya Kalan:</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">{countdown || "Hesaplanıyor..."}</span>
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
                Mevcut Periyot Sıralaması (Top 10)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 pb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <th className="py-3 px-4">Sıra</th>
                      <th className="py-3 px-4">Kullanıcı Adı</th>
                      <th className="py-3 px-4 text-right">Toplam Puan</th>
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
                            <span className="flex items-center gap-2.5">
                              {isCurrentUser && (
                                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                                  Siz
                                </span>
                              )}
                              <span className="truncate max-w-[150px] sm:max-w-none">
                                {row.displayName}
                              </span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black font-mono text-white text-sm sm:text-base">
                            {row.taraftarPuani ?? 0} <span className="text-[10px] text-zinc-500 font-normal">Puan</span>
                          </td>
                        </tr>
                      );
                    })}

                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-sm text-zinc-500">
                          Bu periyotta henüz katılım gösteren bir kullanıcı yok. İlk puanı siz kazanın!
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
                      <h4 className="text-sm font-bold text-white">Sizin Durumunuz</h4>
                      <p className="text-xs text-emerald-400/80">Liderlik mücadelesine katılın!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-400">Sıranız:</div>
                    <div className="text-sm sm:text-base font-extrabold text-white font-mono">
                      {myRank > 0 ? `${myRank}. Sıra` : "Sıralama dışı"}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      Puanınız: <span className="font-bold text-emerald-400">{myProfile.mevcutPeriyotPuani}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* If user is guest */}
            {!isSignedIn && (
              <div className="rounded-xl border border-white/10 bg-[#060b14]/30 p-5 text-center shadow-lg">
                <p className="text-sm text-zinc-400 mb-3">
                  Sıralamada kendi yerinizi görmek ve periyot yarışı ödüllerini kazanabilmek için giriş yapın!
                </p>
                <SignInButton mode="modal">
                  <button className="rounded-lg bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-bold text-[#060b14] hover:bg-emerald-400 transition-colors">
                    Hemen Giriş Yap
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
                CupMat Ödül Sıralaması
              </h2>
              <p className="mb-4 text-xs text-zinc-400">
                Periyot sonunda ilk 3&apos;e girenlere MinMat ödülleri verilir. Sadece e-posta ile giriş yapanlar dahildir.
              </p>
              {cupMatRewards.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">
                  Bu periyotta henüz uygun kullanıcı yok.
                </div>
              ) : (
                <div className="space-y-2">
                  {cupMatRewards.slice(0, 10).map((entry) => (
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
                        {entry.reward && (
                          <div className="text-[10px] text-amber-400 mt-0.5">{entry.reward}</div>
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
                MinMat Ödül Sıralaması
              </h2>
              <p className="mb-4 text-xs text-zinc-400">
                Periyot sonunda MinMat&apos;ta ilk 3&apos;e girenlere CupMat global puan ödülleri verilir.
              </p>
              {minMatRewards.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">
                  Bu periyotta henüz uygun kullanıcı yok.
                </div>
              ) : (
                <div className="space-y-2">
                  {minMatRewards.slice(0, 10).map((entry) => (
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
                        {entry.reward && (
                          <div className="text-[10px] text-purple-400 mt-0.5">{entry.reward}</div>
                        )}
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
                Geçmiş Dönem Şampiyonları
              </h2>

              <div className="space-y-4">
                {gecmisSampiyonlar.length === 0 ? (
                  <div className="text-center py-8 text-sm text-zinc-500">
                    <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                    Henüz tamamlanmış bir periyot bulunmuyor. İlk şampiyonlar 3 gün sonra listelenecek!
                  </div>
                ) : (
                  // Group by Date
                  Object.entries(
                    gecmisSampiyonlar.reduce((groups, item) => {
                      const date = new Date(item.periyotBitisTarihi).toLocaleDateString("tr-TR", {
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
                        <span>{date} Periyodu Sonuçları</span>
                      </div>

                      <div className="space-y-2">
                        {champs.sort((a,b) => a.derece - b.derece).map((champ) => (
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
                              {champ.derece}. Derece
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
