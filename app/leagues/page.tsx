"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { PageShell } from "@/components/PageShell";
import { useTranslation } from "@/contexts/LocaleContext";
import { 
  Trophy, Plus, Key, Users, Copy, Check, LogOut, ArrowRight, Shield, Calendar
} from "lucide-react";

interface League {
  id: string;
  name: string;
  createdBy: string;
  creatorNickname: string;
  joinCode: string;
  createdAt: string;
  joinedAt: string;
  memberCount: number;
}

interface LeaderboardEntry {
  userId: string;
  nickname: string;
  score: number;
  rank: number;
  rosterPoints?: number;
  joinedAt: string;
}

export default function LeaguesPage() {
  const { t } = useTranslation();
  const { isSignedIn, user } = useUser();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected League States
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [standingsType, setStandingsType] = useState<"predictions" | "fantasy" | "taraftar">("predictions");
  const [loadingStandings, setLoadingStandings] = useState(false);

  // Forms
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);
  
  // Clipboard
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      fetchLeagues();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (selectedLeague) {
      fetchLeaderboard(selectedLeague.id, standingsType);
    }
  }, [selectedLeague, standingsType]);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leagues");
      const data = await res.json();
      if (data.success) {
        setLeagues(data.leagues || []);
        // Reset selected league with fresh data if it was already selected
        if (selectedLeague) {
          const fresh = data.leagues.find((l: League) => l.id === selectedLeague.id);
          if (fresh) {
            setSelectedLeague(fresh);
          } else {
            setSelectedLeague(null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching leagues:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (leagueId: string, type: string) => {
    try {
      setLoadingStandings(true);
      const res = await fetch(`/api/leagues/leaderboard?leagueId=${leagueId}&type=${type}`);
      const data = await res.json();
      if (data.success) {
        setStandings(data.leaderboard || []);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoadingStandings(false);
    }
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || submittingCreate) return;

    try {
      setSubmittingCreate(true);
      const res = await fetch("/api/leagues/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName }),
      });
      const data = await res.json();

      if (data.success) {
        setCreateName("");
        await fetchLeagues();
        // Automatically select the newly created league
        setSelectedLeague(data.league);
      } else {
        alert(data.error || "Lig oluşturulamadı.");
      }
    } catch (err) {
      console.error("Error creating league:", err);
      alert("Bir hata oluştu.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || submittingJoin) return;

    try {
      setSubmittingJoin(true);
      const res = await fetch("/api/leagues/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });
      const data = await res.json();

      if (data.success) {
        setJoinCode("");
        await fetchLeagues();
        // Retrieve and select the joined league
        const resList = await fetch("/api/leagues");
        const listData = await resList.json();
        if (listData.success) {
          const joined = listData.leagues.find((l: League) => l.id === data.league.id);
          if (joined) setSelectedLeague(joined);
        }
      } else {
        alert(data.error || "Lige katılım sağlanamadı.");
      }
    } catch (err) {
      console.error("Error joining league:", err);
      alert("Bir hata oluştu.");
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (!window.confirm("Bu ligden ayrılmak istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch("/api/leagues/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId }),
      });
      const data = await res.json();

      if (data.success) {
        setSelectedLeague(null);
        await fetchLeagues();
      } else {
        alert(data.error || "Ligden ayrılamadı.");
      }
    } catch (err) {
      console.error("Error leaving league:", err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell title={t("leagues.title")} subtitle={t("leagues.subtitle")}>
      {/* Guest Banner */}
      {!isSignedIn && (
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm sm:flex-row">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">{t("gamification.guestPrompt")}</h3>
              <p className="text-sm text-zinc-400">Kendi özel liglerinizi kurmak veya arkadaşlarınızın ligine katılmak için giriş yapın.</p>
            </div>
          </div>
          <SignInButton mode="modal">
            <button className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all hover:bg-emerald-400 sm:w-auto">
              {t("gamification.loginNow")}
            </button>
          </SignInButton>
        </div>
      )}

      {isSignedIn && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Leagues List and Forms */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Create League Card */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/10 p-5 backdrop-blur-md">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <Plus className="h-5 w-5 text-emerald-400" />
                {t("leagues.createLeague")}
              </h3>
              <form onSubmit={handleCreateLeague} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("leagues.leagueName")}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  maxLength={30}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingCreate || !createName.trim()}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 disabled:opacity-50"
                >
                  {t("leagues.createBtn")}
                </button>
              </form>
            </div>

            {/* Join League Card */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/10 p-5 backdrop-blur-md">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <Key className="h-5 w-5 text-emerald-400" />
                {t("leagues.joinLeague")}
              </h3>
              <form onSubmit={handleJoinLeague} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("leagues.enterCode")}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  disabled={submittingJoin || !joinCode.trim()}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 disabled:opacity-50"
                >
                  {t("leagues.joinBtn")}
                </button>
              </form>
            </div>

            {/* Joined Leagues List */}
            <div className="rounded-3xl border border-zinc-850 bg-zinc-900/10 p-5 backdrop-blur-md">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <Users className="h-5 w-5 text-emerald-400" />
                Dahil Olduğunuz Ligler
              </h3>
              {loading ? (
                <p className="text-center py-4 text-xs text-zinc-500">{t("predictions.loading")}</p>
              ) : leagues.length === 0 ? (
                <p className="text-center py-6 text-sm text-zinc-500">{t("leagues.emptyState")}</p>
              ) : (
                <div className="space-y-2">
                  {leagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => {
                        setSelectedLeague(league);
                        setStandingsType("predictions");
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                        selectedLeague?.id === league.id
                          ? "border-emerald-500 bg-emerald-950/10 text-white"
                          : "border-zinc-850 bg-zinc-950/30 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm">{league.name}</h4>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {t("leagues.createdBy")}: {league.creatorNickname}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Users className="h-3.5 w-3.5" />
                        {league.memberCount} {t("leagues.membersCount")}
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Detailed Standings */}
          <div className="lg:col-span-8">
            {selectedLeague ? (
              <div className="rounded-3xl border border-zinc-850 bg-zinc-900/10 p-6 backdrop-blur-md">
                
                {/* League Header */}
                <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedLeague.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-zinc-500" />
                        {t("leagues.createdBy")}: {selectedLeague.creatorNickname}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        Kuruluş: {new Date(selectedLeague.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Copy Join Code */}
                    <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950/40 p-1">
                      <span className="px-3 text-xs text-zinc-500">{t("leagues.joinCode")}</span>
                      <code className="bg-zinc-900 text-emerald-400 text-xs font-bold px-2.5 py-1.5 rounded-lg select-all">
                        {selectedLeague.joinCode}
                      </code>
                      <button
                        onClick={() => handleCopyCode(selectedLeague.joinCode)}
                        className="p-1.5 text-zinc-400 hover:text-white transition-all"
                        title={t("leagues.joinCode")}
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Leave League */}
                    <button
                      onClick={() => handleLeaveLeague(selectedLeague.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/10 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-950/30"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t("leagues.leaveLeague")}
                    </button>
                  </div>
                </div>

                {/* Standing Tabs */}
                <div className="mb-6 flex border-b border-zinc-800/80 p-0.5">
                  <button
                    onClick={() => setStandingsType("predictions")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                      standingsType === "predictions"
                        ? "border-emerald-500 text-emerald-400"
                        : "border-transparent text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t("leagues.typePredictions")}
                  </button>
                  <button
                    onClick={() => setStandingsType("fantasy")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                      standingsType === "fantasy"
                        ? "border-emerald-500 text-emerald-400"
                        : "border-transparent text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t("leagues.typeFantasy")}
                  </button>
                  <button
                    onClick={() => setStandingsType("taraftar")}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                      standingsType === "taraftar"
                        ? "border-emerald-500 text-emerald-400"
                        : "border-transparent text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t("leagues.typeTaraftar")}
                  </button>
                </div>

                {/* Standings List */}
                {loadingStandings ? (
                  <div className="py-20 text-center text-zinc-500">{t("predictions.loading")}</div>
                ) : standings.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500">Üye verisi yüklenemedi.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-zinc-300">
                      <thead>
                        <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase">
                          <th className="pb-3 pl-4">{t("leagues.rank")}</th>
                          <th className="pb-3">{t("leagues.user")}</th>
                          {standingsType === "fantasy" && (
                            <th className="pb-3 text-right">Roster Pts</th>
                          )}
                          <th className="pb-3 pr-4 text-right">{t("leagues.score")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((entry) => {
                          const isMe = entry.userId === user?.id;
                          return (
                            <tr
                              key={entry.userId}
                              className={`border-b border-zinc-850/40 transition-all ${
                                isMe ? "bg-emerald-500/5 text-white font-medium" : "hover:bg-zinc-950/10"
                              }`}
                            >
                              <td className="py-4 pl-4 font-bold">
                                {entry.rank === 1 ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 text-xs">
                                    🥇
                                  </span>
                                ) : entry.rank === 2 ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-300/10 text-zinc-300 text-xs">
                                    🥈
                                  </span>
                                ) : entry.rank === 3 ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-orange-700/10 text-orange-400 text-xs">
                                    🥉
                                  </span>
                                ) : (
                                  `${entry.rank}.`
                                )}
                              </td>
                              <td className="py-4">
                                <span className={isMe ? "text-emerald-400 font-bold" : "text-zinc-200"}>
                                  {entry.nickname}
                                </span>
                                {isMe && (
                                  <span className="ml-2 inline-flex rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-400">
                                    {t("gamification.you")}
                                  </span>
                                )}
                              </td>
                              {standingsType === "fantasy" && (
                                <td className="py-4 text-right text-zinc-400 font-mono">
                                  {entry.rosterPoints ?? 0}
                                </td>
                              )}
                              <td className="py-4 pr-4 text-right font-bold font-mono text-emerald-400">
                                {entry.score}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/10 text-zinc-500">
                <Trophy className="mb-4 h-12 w-12 text-zinc-600" />
                <p className="text-sm">Detayları ve sıralamaları görmek için soldan bir lig seçin veya yeni bir lig oluşturun.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
