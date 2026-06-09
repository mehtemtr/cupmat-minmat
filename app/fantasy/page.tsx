"use client";

import { PageShell } from "@/components/PageShell";
import { useUser } from "@clerk/nextjs";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { useState, useEffect, useMemo } from "react";
import { getAllPlayers } from "@/data/teams";
import { OFFICIAL_GROUP_DRAW } from "@/data/official-groups";
import { Shield, Users, Award, Calendar, Settings, Play, CheckCircle, AlertTriangle, ArrowRight, Star, RefreshCw } from "lucide-react";

// Position mapper helper
function getGeneralPosition(pos: string): "GK" | "DEF" | "MID" | "FWD" {
  const p = pos?.toLowerCase() || "";
  if (p.includes("gk") || p.includes("kaleci") || p.includes("portero") || p.includes("gardien") || p.includes("torwart")) return "GK";
  if (p.includes("df") || p.includes("defans") || p.includes("bek") || p.includes("stoper") || p.includes("defensor") || p.includes("défenseur") || p.includes("abwehr")) return "DEF";
  if (p.includes("mf") || p.includes("orta saha") || p.includes("libero") || p.includes("midfielder") || p.includes("centrocampista") || p.includes("milieu") || p.includes("mittelfeld") || p.includes("açık")) return "MID";
  if (p.includes("fw") || p.includes("forvet") || p.includes("delantero") || p.includes("attaquant") || p.includes("sturm")) return "FWD";
  return "FWD";
}

function getBenchDefaultPosition(slotIdx: number, totalSlots: number): "GK" | "DEF" | "MID" | "FWD" {
  if (totalSlots === 1) {
    return "MID";
  }
  if (totalSlots === 2) {
    if (slotIdx === 0) return "MID";
    return "DEF";
  }
  if (totalSlots === 3) {
    if (slotIdx === 0) return "GK";
    if (slotIdx === 1) return "MID";
    return "DEF";
  }
  if (totalSlots >= 4) {
    if (slotIdx === 0) return "GK";
    if (slotIdx === 1) return "DEF";
    if (slotIdx === 2) return "MID";
    return "FWD";
  }
  return "MID";
}

// Map country codes to World Cup Groups (A-L)
const teamToGroup: Record<string, string> = {};
for (const [group, teams] of Object.entries(OFFICIAL_GROUP_DRAW)) {
  for (const team of teams) {
    teamToGroup[team.toLowerCase()] = group;
  }
}

// Local timezone targets for June 8, 2026
const TEASER_TIME = new Date("2026-06-08T19:03:00+03:00");
const UNLOCK_TIME = new Date("2026-06-08T19:23:00+03:00");

export default function FantasyPage() {
  const { user: clerkUser, isSignedIn: clerkIsSignedIn } = useUser();
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"builder" | "standings" | "fixtures" | "commonXI" | "allTeams">("builder");
  const [stage, setStage] = useState("matchday_1");
  const [teamIndex, setTeamIndex] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [formation, setFormation] = useState("4-4-2");
  
  // Selected IDs
  const [starters, setStarters] = useState<(string | null)[]>(Array(11).fill(null));
  const [bench, setBench] = useState<(string | null)[]>([]);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  // States from API
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [unlockProgress, setUnlockProgress] = useState<any>(null);
  const [maxTeams, setMaxTeams] = useState(1);
  const [allowedBenchSlots, setAllowedBenchSlots] = useState(0);
  const [originalRoster, setOriginalRoster] = useState<any>(null);
  const [hasRoster, setHasRoster] = useState<boolean | null>(null);
  const [isStageActive, setIsStageActive] = useState<boolean>(false);
  const [minmatGamesToday, setMinmatGamesToday] = useState<number>(0);

  // Compute transfers count in real time
  const newTransfersCount = useMemo(() => {
    if (!originalRoster) return 0;
    const prevPlayers = new Set([
      ...(originalRoster.starters || []).map((p: any) => p?.id || p),
      ...(originalRoster.bench || []).map((p: any) => p?.id || p),
    ]);
    const currentPlayers = [...starters, ...bench].filter(Boolean);
    let diff = 0;
    currentPlayers.forEach((id) => {
      if (id && !prevPlayers.has(id)) {
        diff++;
      }
    });
    return diff;
  }, [originalRoster, starters, bench]);
  
  // Standings / Duels state
  const [standings, setStandings] = useState<any[]>([]);
  const [duels, setDuels] = useState<any[]>([]);
  const [userDuel, setUserDuel] = useState<any>(null);
  const [commonMindXI, setCommonMindXI] = useState<any[]>([]);
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);

  // UI state
  const [teaserBypass, setTeaserBypass] = useState(false);
  const [adminSecretInput, setAdminSecretInput] = useState("");
  const [adminBypass, setAdminBypass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Is the page fully unlocked? (after 19:23, or if admin/bypass is active)
  const isFullyUnlocked = useMemo(() => {
    if (teaserBypass) return true;
    if (!currentTime) return false;
    return currentTime >= UNLOCK_TIME;
  }, [teaserBypass, currentTime]);

  // Is the teaser visible? (from 19:03 onwards)
  const isTeaserVisible = useMemo(() => {
    if (isFullyUnlocked) return true;
    if (!currentTime) return false;
    return currentTime >= TEASER_TIME;
  }, [isFullyUnlocked, currentTime]);

  // Countdown timer string (minutes and seconds until 19:23)
  const countdownText = useMemo(() => {
    if (!currentTime) return "00:00";
    const diffMs = UNLOCK_TIME.getTime() - currentTime.getTime();
    if (diffMs <= 0) return "00:00";
    const totalSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [currentTime]);

  // Derive mock session for local development testing
  const isSignedIn = clerkIsSignedIn || teaserBypass;
  
  // Player Selection Drawer Modal State
  const [selectorModal, setSelectorModal] = useState<{
    isOpen: boolean;
    slotIndex: number | null; // index in starters (0-10) or bench
    isBench: boolean;
    positionFilter: "GK" | "DEF" | "MID" | "FWD" | null;
  }>({
    isOpen: false,
    slotIndex: null,
    isBench: false,
    positionFilter: null,
  });

  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [playerSearchTeamFilter, setPlayerSearchTeamFilter] = useState("");

  const allPlayersList = useMemo(() => getAllPlayers(), []);

  // Filtered players inside the selector modal
  const searchablePlayers = useMemo(() => {
    return allPlayersList.filter((p) => {
      const pGenPos = getGeneralPosition(p.position);
      const matchesPosition = !selectorModal.positionFilter || pGenPos === selectorModal.positionFilter;
      
      const matchesSearch =
        p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
        p.club.toLowerCase().includes(playerSearchQuery.toLowerCase());
        
      const matchesTeam =
        !playerSearchTeamFilter || p.teamId.toLowerCase() === playerSearchTeamFilter.toLowerCase();

      // Ensure we don't select a player already in starters or bench
      const isAlreadySelected = starters.includes(p.id) || bench.includes(p.id);

      return matchesPosition && matchesSearch && matchesTeam && !isAlreadySelected;
    });
  }, [allPlayersList, selectorModal.positionFilter, playerSearchQuery, playerSearchTeamFilter, starters, bench]);

  // Load configuration and status
  useEffect(() => {
    // Check local bypass
    if (typeof window !== "undefined") {
      const bypass = localStorage.getItem("wc2026_fantasy_bypass") === "true";
      setTeaserBypass(bypass);
      
      const sec = localStorage.getItem("wc2026_fantasy_admin_bypass") === "true";
      setAdminBypass(sec);
    }
  }, []);

  const loadStatusAndData = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      // 1. Fetch unlock status
      const resUnlock = await fetch(`/api/fantasy/unlock-status?stage=${stage}&teamIndex=${teamIndex}`);
      const dataUnlock = await resUnlock.json();
      if (dataUnlock.success) {
        setUnlocked(dataUnlock.unlocked);
        setUnlockProgress(dataUnlock.progress);
        setMaxTeams(dataUnlock.maxTeams);
        setAllowedBenchSlots(dataUnlock.benchSlots);
        setBench(Array(dataUnlock.benchSlots).fill(null));
        setHasRoster(dataUnlock.hasRoster);
        setIsStageActive(dataUnlock.isStageActive);
        setMinmatGamesToday(dataUnlock.minmatOyunSayisiBugun);
      }

      // 2. Fetch rosters
      const resRosters = await fetch(`/api/fantasy/roster?stage=${stage}`);
      const dataRosters = await resRosters.json();
      if (dataRosters.success && dataRosters.rosters) {
        const activeRoster = dataRosters.rosters.find((r: any) => r.team_index === teamIndex);
        if (activeRoster) {
          setOriginalRoster(activeRoster);
          setTeamName(activeRoster.team_name || "");
          setFormation(activeRoster.formation || "4-4-2");
          setSelectedManager(activeRoster.manager_id || null);
          
          // Rebuild starters array
          const newStarters = Array(11).fill(null);
          (activeRoster.starters || []).forEach((p: any, idx: number) => {
            if (p && p.id) newStarters[idx] = p.id;
          });
          setStarters(newStarters);

          // Rebuild bench array
          const newBench = Array(dataUnlock.benchSlots).fill(null);
          (activeRoster.bench || []).forEach((p: any, idx: number) => {
            if (p && p.id && idx < newBench.length) newBench[idx] = p.id;
          });
          setBench(newBench);
        } else {
          setOriginalRoster(null);
          // Clear
          setTeamName("");
          setStarters(Array(11).fill(null));
          setBench(Array(dataUnlock.benchSlots).fill(null));
          setSelectedManager(null);
        }
      } else {
        setOriginalRoster(null);
      }

      // 3. Fetch duels / standings
      const resDuels = await fetch(`/api/fantasy/duels?stage=${stage}`);
      const dataDuels = await resDuels.json();
      if (dataDuels.success) {
        setStandings(dataDuels.standings || []);
        setDuels(dataDuels.duels || []);
        setUserDuel(dataDuels.userDuel || null);
        setCommonMindXI(dataDuels.commonMindXI || []);
        setRegisteredTeams(dataDuels.registeredTeams || []);
      }
    } catch (e) {
      console.error("Error loading fantasy data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      loadStatusAndData();
    }
  }, [isSignedIn, stage, teamIndex]);

  // Handle teaser lock bypass check
  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSecretInput === "admin" || adminSecretInput === "minmat_odul_2026") {
      localStorage.setItem("wc2026_fantasy_bypass", "true");
      setTeaserBypass(true);
      if (adminSecretInput === "minmat_odul_2026") {
        localStorage.setItem("wc2026_fantasy_admin_bypass", "true");
        setAdminBypass(true);
      }
      setAdminSecretInput("");
    } else {
      alert("Geçersiz şifre!");
    }
  };

  const handleAdminTrigger = async (actionType: string) => {
    try {
      const res = await fetch("/api/fantasy/trigger-matchday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "minmat_odul_2026",
        },
        body: JSON.stringify({
          stage,
          action: actionType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Eylem başarıyla tamamlandı:\n" + data.reports.join("\n"));
        loadStatusAndData();
      } else {
        alert("Hata: " + data.error);
      }
    } catch (e: any) {
      alert("Hata oluştu: " + e.message);
    }
  };

  // Convert player ids back to detailed objects
  const detailedStarters = useMemo(() => {
    return starters.map((id) => {
      if (!id) return null;
      return allPlayersList.find((p) => p.id === id) || null;
    });
  }, [starters, allPlayersList]);

  const detailedBench = useMemo(() => {
    return bench.map((id) => {
      if (!id) return null;
      return allPlayersList.find((p) => p.id === id) || null;
    });
  }, [bench, allPlayersList]);

  // Formations configuration: GK, DEF, MID, FWD structure
  const currentFormationConfig = useMemo(() => {
    const parts = formation.split("-").map(Number);
    return {
      DEF: parts[0] || 4,
      MID: parts[1] || 4,
      FWD: parts[2] || 2,
    };
  }, [formation]);

  // Map slots in starting XI array (0 to 10) to actual positions
  // Slot 0: GK
  // Slots 1 to reqDEF: DEF
  // Slots 1+reqDEF to reqDEF+reqMID: MID
  // Remaining: FWD
  const starterPositions = useMemo(() => {
    const { DEF, MID } = currentFormationConfig;
    const positions: ("GK" | "DEF" | "MID" | "FWD")[] = ["GK"];
    for (let i = 0; i < DEF; i++) positions.push("DEF");
    for (let i = 0; i < MID; i++) positions.push("MID");
    for (let i = 0; i < 11 - 1 - DEF - MID; i++) positions.push("FWD");
    return positions;
  }, [currentFormationConfig]);

  // Dynamic limits calculation
  const limitsStatus = useMemo(() => {
    const allSelected = [...starters, ...bench].filter(Boolean) as string[];
    const counts: Record<string, number> = {};
    const groupCounts: Record<string, number> = {};
    
    let countryLimit = 3;
    const stg = stage.toLowerCase();
    if (stg.includes("quarter")) countryLimit = 5;
    else if (stg.includes("semi") || stg.includes("final")) countryLimit = 7;
    else if (stg.includes("round")) countryLimit = 4;

    let countryLimitPassed = true;
    let groupLimitPassed = true;

    const countryViolations: string[] = [];
    const groupViolations: string[] = [];

    allSelected.forEach((id) => {
      const p = allPlayersList.find((x) => x.id === id);
      if (p) {
        const country = p.teamId.toLowerCase();
        counts[country] = (counts[country] || 0) + 1;
        if (counts[country] > countryLimit) {
          countryLimitPassed = false;
          if (!countryViolations.includes(p.teamNameTr)) {
            countryViolations.push(p.teamNameTr);
          }
        }

        const grp = teamToGroup[country];
        if (grp) {
          groupCounts[grp] = (groupCounts[grp] || 0) + 1;
          if (groupCounts[grp] > 5) {
            groupLimitPassed = false;
            if (!groupViolations.includes(grp)) {
              groupViolations.push(grp);
            }
          }
        }
      }
    });

    return {
      countryLimit,
      countryLimitPassed,
      groupLimitPassed,
      countryViolations,
      groupViolations,
    };
  }, [starters, bench, stage, allPlayersList]);

  // Open player drawer modal
  const openSelector = (slotIndex: number, isBench: boolean, position: "GK" | "DEF" | "MID" | "FWD") => {
    setSelectorModal({
      isOpen: true,
      slotIndex,
      isBench,
      positionFilter: position,
    });
    setPlayerSearchQuery("");
    setPlayerSearchTeamFilter("");
  };

  const selectPlayer = (playerId: string) => {
    const { slotIndex, isBench } = selectorModal;
    if (slotIndex === null) return;

    if (isBench) {
      const newBench = [...bench];
      newBench[slotIndex] = playerId;
      setBench(newBench);
    } else {
      const newStarters = [...starters];
      newStarters[slotIndex] = playerId;
      setStarters(newStarters);
    }

    setSelectorModal({ isOpen: false, slotIndex: null, isBench: false, positionFilter: null });
  };

  const removePlayer = (slotIndex: number, isBench: boolean) => {
    if (isBench) {
      const newBench = [...bench];
      newBench[slotIndex] = null;
      setBench(newBench);
    } else {
      const newStarters = [...starters];
      newStarters[slotIndex] = null;
      setStarters(newStarters);
    }
  };

  // Save Roster to database
  const saveRoster = async () => {
    setSaveStatus(null);
    const filledStarters = starters.filter(Boolean);
    if (filledStarters.length < 11) {
      setSaveStatus({ type: "error", msg: t("fantasy.startersRequired") });
      return;
    }

    if (!teamName.trim()) {
      setSaveStatus({ type: "error", msg: t("fantasy.teamNameRequired") });
      return;
    }

    if (!limitsStatus.countryLimitPassed) {
      setSaveStatus({
        type: "error",
        msg: t("fantasy.countryLimitPassed")
          .replace("{limit}", limitsStatus.countryLimit.toString())
          .replace("{countries}", limitsStatus.countryViolations.join(", ")),
      });
      return;
    }

    if (!limitsStatus.groupLimitPassed) {
      setSaveStatus({
        type: "error",
        msg: t("fantasy.groupLimitPassed")
          .replace("{groups}", limitsStatus.groupViolations.join(", ")),
      });
      return;
    }

    try {
      const res = await fetch("/api/fantasy/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          stage,
          formation,
          starters: starters.filter(Boolean),
          bench: bench.filter(Boolean),
          managerId: selectedManager,
          teamIndex,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ type: "success", msg: data.message });
        loadStatusAndData();
      } else {
        setSaveStatus({ type: "error", msg: data.error || t("fantasy.saveError") });
      }
    } catch (e: any) {
      setSaveStatus({ type: "error", msg: t("fantasy.networkError").replace("{msg}", e.message) });
    }
  };

  // Render Teaser / Pre-teaser Page initially (for all users, whether logged in or not)
  if (!isFullyUnlocked) {
    if (!isTeaserVisible) {
      return (
        <PageShell title={t("fantasy.title")} subtitle={t("fantasy.subtitle")}>
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-xl max-w-2xl mx-auto shadow-2xl">
            <Shield className="w-16 h-16 text-slate-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-slate-200 mb-3 uppercase tracking-wider">{t("fantasy.teaserWaitTitle")}</h2>
            <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
              {t("fantasy.teaserWaitDesc").replace("{time}", "19:03")}
            </p>
            <div className="text-xs text-slate-600 font-semibold">
              {t("fantasy.teaserWaitPending")}
            </div>
          </div>
        </PageShell>
      );
    }

    return (
      <PageShell title={t("fantasy.title")} subtitle={t("fantasy.subtitle")}>
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header & Countdown Card */}
          <div className="flex flex-col items-center text-center p-8 md:p-12 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {t("fantasy.teaserLiveBadge")}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 uppercase">
              {t("fantasy.teaserTitle").replace("{time}", "19:23")}
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
              {t("fantasy.teaserDesc")}
            </p>

            {/* Countdown Display */}
            <div className="bg-slate-950/80 px-8 py-5 rounded-2xl border border-slate-800 shadow-inner inline-flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-mono font-black text-emerald-400 tracking-wider">
                {countdownText}
              </span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-2">
                {t("fantasy.teaserCountdownLabel")}
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 shadow-xl">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider text-center">
              {t("fantasy.teaserIntroTitle")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="flex gap-4 p-5 bg-slate-950/40 rounded-2xl border border-slate-900 hover:border-slate-800 transition-all duration-300">
                <Users className="w-10 h-10 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-slate-200 mb-1">{t("fantasy.feature1Title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("fantasy.feature1Desc")}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 p-5 bg-slate-950/40 rounded-2xl border border-slate-900 hover:border-slate-800 transition-all duration-300">
                <Award className="w-10 h-10 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-slate-200 mb-1">{t("fantasy.feature2Title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("fantasy.feature2Desc")}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 p-5 bg-slate-950/40 rounded-2xl border border-slate-900 hover:border-slate-800 transition-all duration-300">
                <Shield className="w-10 h-10 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-slate-200 mb-1">{t("fantasy.feature3Title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("fantasy.feature3Desc")}
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4 p-5 bg-slate-950/40 rounded-2xl border border-slate-900 hover:border-slate-800 transition-all duration-300">
                <Calendar className="w-10 h-10 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-slate-200 mb-1">{t("fantasy.feature4Title")}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("fantasy.feature4Desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Bypass box for local testing / quick entry */}
            <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col items-center">
              <form onSubmit={handleBypassSubmit} className="flex gap-2 max-w-sm w-full">
                <input
                  type="password"
                  placeholder={t("fantasy.devPasswordPlaceholder")}
                  value={adminSecretInput}
                  onChange={(e) => setAdminSecretInput(e.target.value)}
                  className="bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 flex-grow"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                >
                  Bypass
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // Once bypassed, enforce sign-in (or mock it for dev)
  if (!isSignedIn) {
    return (
      <PageShell title={t("fantasy.title")} subtitle={t("fantasy.subtitle")}>
        <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <Shield className="w-16 h-16 text-emerald-400 mb-6 animate-pulse" />
          <h2 className="text-2xl font-black text-white mb-2">{t("fantasy.needLogin")}</h2>
          <p className="text-slate-400 max-w-md mb-8">
            {t("fantasy.needLoginDesc")}
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={t("fantasy.title")}
      subtitle={t("fantasy.subtitle")}
    >
      {/* Admin Settings bar */}
      {adminBypass && (
        <div className="mb-6 p-4 bg-slate-950/80 border border-amber-500/20 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">Yönetici Paneli (Bypass Aktif)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAdminTrigger("pair")}
              className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl text-xs font-semibold"
            >
              H2H Eşleştirme Yap
            </button>
            <button
              onClick={() => handleAdminTrigger("calculate")}
              className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl text-xs font-semibold"
            >
              Skorları Hesapla
            </button>
            <button
              onClick={() => handleAdminTrigger("standings")}
              className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl text-xs font-semibold"
            >
              Puan Durumunu Güncelle
            </button>
            <button
              onClick={() => handleAdminTrigger("all")}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl text-xs font-bold"
            >
              Hepsini Tetikle
            </button>
          </div>
        </div>
      )}

      {/* Check Qualifications */}
      {unlocked === false && unlockProgress && (
        <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-6">
          <AlertTriangle className="w-12 h-12 text-rose-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-black text-white mb-2">{t("fantasy.lockedTitle")}</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-xl">
              {isStageActive
                ? t("fantasy.lockedStageActive")
                : t("fantasy.lockedStageInactive")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {unlockProgress.categoryStatus.map((c: any) => {
                const reqLvl = isStageActive ? 7 : 3;
                const isLvlPassed = c.level >= reqLvl;
                
                // Translate category name
                let categoryName = c.category;
                if (c.category === "add") categoryName = t("gamification.modes.add");
                else if (c.category === "sub") categoryName = t("gamification.modes.sub");
                else if (c.category === "mul") categoryName = t("gamification.modes.mul");
                else if (c.category === "div") categoryName = t("gamification.modes.div");
                else if (c.category === "mix") categoryName = t("gamification.modes.mix");

                return (
                  <div key={c.category} className="bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                    <p className="text-xs font-bold text-slate-300 capitalize mb-1">
                      {categoryName}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] ${isLvlPassed ? "text-emerald-400" : "text-rose-400"}`}>
                        {t("fantasy.levelLabel").replace("{lvl}", c.level.toString()).replace("{req}", reqLvl.toString()).replace("{check}", isLvlPassed ? "✓" : "")}
                      </span>
                      {!isStageActive && (
                        <span className={`text-[10px] ${c.gamesPlayed >= 5 ? "text-emerald-400" : "text-rose-400"}`}>
                          {t("fantasy.gameLabel").replace("{played}", c.gamesPlayed.toString()).replace("{check}", c.gamesPlayed >= 5 ? "✓" : "")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <a
              href="/minmat"
              className="inline-flex items-center gap-2 mt-4 text-emerald-400 font-bold hover:text-emerald-300 text-sm"
            >
              {t("fantasy.minmatGoBtn")} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Setup controls & Pitch */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active settings controls */}
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-xl flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Stage selector */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                  {t("fantasy.stageSelectorLabel")}
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-sm font-bold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="matchday_1">{t("fantasy.stages.matchday_1")}</option>
                  <option value="matchday_2">{t("fantasy.stages.matchday_2")}</option>
                  <option value="matchday_3">{t("fantasy.stages.matchday_3")}</option>
                  <option value="round_of_32">{t("fantasy.stages.round_of_32")}</option>
                  <option value="round_of_16">{t("fantasy.stages.round_of_16")}</option>
                  <option value="quarter_finals">{t("fantasy.stages.quarter_finals")}</option>
                  <option value="semi_finals">{t("fantasy.stages.semi_finals")}</option>
                  <option value="finals">{t("fantasy.stages.finals")}</option>
                </select>
              </div>

              {/* Team Index selector (maxTeams count) */}
              {maxTeams > 1 && (
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                    {t("fantasy.activeTeamLabel")}
                  </label>
                  <div className="flex gap-1.5">
                    {Array.from({ length: maxTeams }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTeamIndex(i + 1)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                          teamIndex === i + 1
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                            : "bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900"
                        }`}
                      >
                        {t("fantasy.teamUnitNumbered").replace("{num}", (i + 1).toString())}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Formation selector */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                {t("fantasy.formationSelectorLabel")}
              </label>
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="bg-slate-950 text-slate-200 text-sm font-bold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="4-4-2">4-4-2</option>
                <option value="4-3-3">4-3-3</option>
                <option value="3-5-2">3-5-2</option>
                <option value="3-4-3">3-4-3</option>
                <option value="5-3-2">5-3-2</option>
                <option value="5-4-1">5-4-1</option>
              </select>
            </div>
          </div>

          {/* Soccer pitch visual builder */}
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-xl p-6 relative overflow-hidden">
            {/* Team details name input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={t("fantasy.teamNamePlaceholder")}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="bg-slate-950 text-white font-extrabold text-lg px-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>

            {/* Visual Football Pitch */}
            <div className="bg-gradient-to-b from-emerald-950 to-emerald-900 relative rounded-3xl border border-emerald-800/80 shadow-2xl p-4 overflow-hidden aspect-[4/5] md:aspect-[3/4]">
              {/* Pitch layout markers */}
              <div className="absolute inset-0 border-2 border-emerald-600/20 m-4 rounded-2xl pointer-events-none" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-600/20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-emerald-600/20 rounded-full pointer-events-none" />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-emerald-600/20 border-t-0 pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-emerald-600/20 border-b-0 pointer-events-none" />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-56 h-36 border-2 border-emerald-600/20 border-t-0 pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-56 h-36 border-2 border-emerald-600/20 border-b-0 pointer-events-none" />
              
              {/* Tactical grid positioning for players based on formation selection */}
              <div className="h-full flex flex-col justify-between py-4 relative z-10">
                {/* Forwards row */}
                <div className="flex justify-around items-center h-1/5">
                  {starterPositions.map((pos, i) => {
                    if (pos !== "FWD") return null;
                    const p = detailedStarters[i];
                    return (
                      <button
                        key={i}
                        onClick={() => openSelector(i, false, "FWD")}
                        className="flex flex-col items-center justify-center scale-90 hover:scale-100 transition-all duration-300 relative group"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 shadow-lg ${
                          p ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-emerald-950/60 border-dashed border-emerald-600 text-emerald-600"
                        }`}>
                          {p ? p.name.charAt(0) : "+"}
                        </div>
                        <span className="text-[10px] text-white font-extrabold bg-slate-950/80 px-2 py-0.5 rounded-lg mt-1 max-w-[80px] truncate">
                          {p ? p.name : t("fantasy.forward")}
                        </span>
                        {p && (
                          <div
                            onClick={(e) => { e.stopPropagation(); removePlayer(i, false); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                          >
                            ×
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Midfielders row */}
                <div className="flex justify-around items-center h-1/5">
                  {starterPositions.map((pos, i) => {
                    if (pos !== "MID") return null;
                    const p = detailedStarters[i];
                    return (
                      <button
                        key={i}
                        onClick={() => openSelector(i, false, "MID")}
                        className="flex flex-col items-center justify-center scale-90 hover:scale-100 transition-all duration-300 relative group"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 shadow-lg ${
                          p ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-emerald-950/60 border-dashed border-emerald-600 text-emerald-600"
                        }`}>
                          {p ? p.name.charAt(0) : "+"}
                        </div>
                        <span className="text-[10px] text-white font-extrabold bg-slate-950/80 px-2 py-0.5 rounded-lg mt-1 max-w-[80px] truncate">
                          {p ? p.name : t("fantasy.midfielder")}
                        </span>
                        {p && (
                          <div
                            onClick={(e) => { e.stopPropagation(); removePlayer(i, false); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                          >
                            ×
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Defenders row */}
                <div className="flex justify-around items-center h-1/5">
                  {starterPositions.map((pos, i) => {
                    if (pos !== "DEF") return null;
                    const p = detailedStarters[i];
                    return (
                      <button
                        key={i}
                        onClick={() => openSelector(i, false, "DEF")}
                        className="flex flex-col items-center justify-center scale-90 hover:scale-100 transition-all duration-300 relative group"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 shadow-lg ${
                          p ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-emerald-950/60 border-dashed border-emerald-600 text-emerald-600"
                        }`}>
                          {p ? p.name.charAt(0) : "+"}
                        </div>
                        <span className="text-[10px] text-white font-extrabold bg-slate-950/80 px-2 py-0.5 rounded-lg mt-1 max-w-[80px] truncate">
                          {p ? p.name : t("fantasy.defender")}
                        </span>
                        {p && (
                          <div
                            onClick={(e) => { e.stopPropagation(); removePlayer(i, false); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                          >
                            ×
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Goalkeeper slot */}
                <div className="flex justify-center items-center h-1/5">
                  {(() => {
                    const p = detailedStarters[0];
                    return (
                      <button
                        onClick={() => openSelector(0, false, "GK")}
                        className="flex flex-col items-center justify-center scale-90 hover:scale-100 transition-all duration-300 relative group"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 shadow-lg ${
                          p ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-emerald-950/60 border-dashed border-emerald-600 text-emerald-600"
                        }`}>
                          {p ? p.name.charAt(0) : "+"}
                        </div>
                        <span className="text-[10px] text-white font-extrabold bg-slate-950/80 px-2 py-0.5 rounded-lg mt-1 max-w-[80px] truncate">
                          {p ? p.name : t("fantasy.goalkeeper")}
                        </span>
                        {p && (
                          <div
                            onClick={(e) => { e.stopPropagation(); removePlayer(0, false); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                          >
                            ×
                          </div>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Bench (Yedekler) Slots */}
            {allowedBenchSlots > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">{t("fantasy.benchTitle").replace("{slots}", allowedBenchSlots.toString())}</h4>
                <div className="flex gap-4">
                  {Array.from({ length: allowedBenchSlots }).map((_, idx) => {
                    const p = detailedBench[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => openSelector(idx, true, p ? getGeneralPosition(p.position) : getBenchDefaultPosition(idx, allowedBenchSlots))}
                        className="flex flex-col items-center justify-center relative group"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black border-2 shadow-md ${
                          p ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-slate-950/60 border-dashed border-slate-700 text-slate-500"
                        }`}>
                          {p ? p.name.charAt(0) : "+"}
                        </div>
                        <span className="text-[9px] text-slate-300 font-extrabold bg-slate-950/40 px-2 py-0.5 rounded-lg mt-1 max-w-[80px] truncate">
                          {p ? p.name : t("fantasy.benchUnit")}
                        </span>
                        {p && (
                          <div
                            onClick={(e) => { e.stopPropagation(); removePlayer(idx, true); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                          >
                            ×
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Save Status & Button */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-800 pt-6">
              {saveStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  saveStatus.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {saveStatus.msg}
                </div>
              )}
              <div className="w-full md:w-auto flex gap-3 ml-auto">
                <button
                  onClick={saveRoster}
                  className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black rounded-2xl shadow-lg transition-all"
                >
                  {t("fantasy.saveBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Dynamic validation dashboard, standings and H2H matches */}
        <div className="lg:col-span-4 space-y-6">
          {/* Qualifications & Dynamic Limits panel */}
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-emerald-400" /> {t("fantasy.limitsTitle")}
            </h3>
            
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-xs text-slate-400">{t("fantasy.initialStatus")}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-black ${unlocked ? "text-emerald-400" : "text-rose-400"}`}>
                {unlocked ? t("fantasy.unlocked") : t("fantasy.locked")}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-xs text-slate-400">{t("fantasy.openRights")}</span>
              <span className="text-xs font-black text-white">{maxTeams} {t("fantasy.teamUnit")}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-xs text-slate-400">{t("fantasy.countryLimitLabel")}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-black ${limitsStatus.countryLimitPassed ? "text-emerald-400" : "text-rose-400"}`}>
                {t("fantasy.countryLimitValue").replace("{limit}", limitsStatus.countryLimit.toString())} {limitsStatus.countryLimitPassed ? "✓" : "⚠"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-xs text-slate-400">{t("fantasy.groupLimitLabel")}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-black ${limitsStatus.groupLimitPassed ? "text-emerald-400" : "text-rose-400"}`}>
                {t("fantasy.groupLimitValue")} {limitsStatus.groupLimitPassed ? "✓" : "⚠"}
              </span>
            </div>

            {isStageActive && originalRoster && (
              <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold">{t("fantasy.transferActive")}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-semibold">{t("fantasy.transferActiveLabel")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t("fantasy.changedPlayers")}</span>
                  <span className="text-xs font-black text-white">{newTransfersCount} {t("fantasy.playersUnit")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t("fantasy.minmatPlayedToday")}</span>
                  <span className={`text-xs font-black ${minmatGamesToday >= newTransfersCount * 3 ? "text-emerald-400" : "text-rose-400"}`}>
                    {minmatGamesToday} {t("fantasy.gamesUnit")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t("fantasy.minmatRequired")}</span>
                  <span className="text-xs font-black text-white">{newTransfersCount * 3} {t("fantasy.gamesUnit")}</span>
                </div>
                {newTransfersCount > 0 && minmatGamesToday < newTransfersCount * 3 && (
                  <div className="mt-1 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-400 font-bold leading-normal">
                    {t("fantasy.minmatAlert").replace("{diff}", (newTransfersCount * 3 - minmatGamesToday).toString())}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* H2H Duel League Standings & Live Score Ticker widget */}
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab("builder")}
                className={`flex-1 pb-3 text-xs font-black border-b-2 transition-all ${
                  activeTab === "builder" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400"
                }`}
              >
                {t("fantasy.tabBuilder")}
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                className={`flex-1 pb-3 text-xs font-black border-b-2 transition-all ${
                  activeTab === "standings" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400"
                }`}
              >
                {t("fantasy.tabStandings")}
              </button>
              <button
                onClick={() => setActiveTab("fixtures")}
                className={`flex-1 pb-3 text-xs font-black border-b-2 transition-all ${
                  activeTab === "fixtures" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400"
                }`}
              >
                {t("fantasy.tabFixtures")}
              </button>
              <button
                onClick={() => setActiveTab("allTeams")}
                className={`flex-1 pb-3 text-xs font-black border-b-2 transition-all ${
                  activeTab === "allTeams" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400"
                }`}
              >
                {t("fantasy.allTeams")}
              </button>
            </div>

            {/* TAB CONTENT: STANDINGS */}
            {activeTab === "standings" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                      <th className="pb-2 font-black">{t("fantasy.colRank")}</th>
                      <th className="pb-2 font-black">{t("fantasy.colUser")}</th>
                      <th className="pb-2 font-black text-center">{t("fantasy.colGp")}</th>
                      <th className="pb-2 font-black text-center">{t("fantasy.colPts")}</th>
                      <th className="pb-2 font-black text-right">{t("fantasy.colTp")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, idx) => (
                      <tr key={row.user_id} className="border-b border-slate-800/40 last:border-0">
                        <td className="py-2.5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 font-extrabold text-white truncate max-w-[100px]">{row.nickname}</td>
                        <td className="py-2.5 font-semibold text-center text-slate-300">{row.played}</td>
                        <td className="py-2.5 font-black text-center text-emerald-400">{row.points}</td>
                        <td className="py-2.5 font-bold text-right text-slate-300">{row.total_roster_points}</td>
                      </tr>
                    ))}
                    {standings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-slate-500 font-semibold">{t("fantasy.noStandings")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: FIXTURES & LIVE MATCH */}
            {activeTab === "fixtures" && (
              <div className="space-y-4">
                {/* Active user H2H detailed box */}
                {userDuel ? (
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase">{t("fantasy.liveDuel")}</span>
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg font-black tracking-widest animate-pulse">{t("fantasy.liveLabel")}</span>
                    </div>
                    <div className="flex justify-between items-center text-center">
                      <div className="flex-1">
                        <p className="font-extrabold text-xs text-white truncate">{userDuel.team1.name}</p>
                        <p className="text-[10px] text-slate-500">{t("fantasy.userLabel")}</p>
                      </div>
                      <div className="px-4 py-1.5 bg-slate-900 rounded-xl">
                        <span className="font-black text-white text-lg">{userDuel.team1.score}</span>
                        <span className="mx-2 text-slate-600 font-bold">-</span>
                        <span className="font-black text-white text-lg">{userDuel.team2.score}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-xs text-white truncate">{userDuel.team2.name}</p>
                        <p className="text-[10px] text-slate-500">{t("fantasy.opponentLabel")}</p>
                      </div>
                    </div>

                    {/* Live events ticker list */}
                    {userDuel.ticker && userDuel.ticker.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-900 space-y-1.5 max-h-32 overflow-y-auto">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t("fantasy.liveLogs")}</p>
                        {userDuel.ticker.map((ticker: any, tIdx: number) => (
                          <div key={tIdx} className={`text-[10px] flex justify-between ${ticker.team === 1 ? "text-emerald-400" : "text-sky-400"}`}>
                            <span>{ticker.player}</span>
                            <span className="font-bold">{ticker.event}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-semibold italic text-center py-2">{t("fantasy.noDuelThisStage")}</p>
                )}

                {/* List of other matches */}
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 font-black tracking-wider uppercase">{t("fantasy.allDuels")}</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {duels.map((d) => (
                      <div key={d.id} className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300 truncate max-w-[80px]">{d.name1}</span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded font-black text-emerald-400">{d.score1} - {d.score2}</span>
                        <span className="font-bold text-slate-300 truncate max-w-[80px] text-right">{d.name2}</span>
                      </div>
                    ))}
                    {duels.length === 0 && (
                      <p className="text-xs text-slate-500 font-semibold italic text-center py-2">{t("fantasy.noFixtures")}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ALL TEAMS */}
            {activeTab === "allTeams" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                      <th className="pb-2 font-black">#</th>
                      <th className="pb-2 font-black">{t("fantasy.teamUnit")}</th>
                      <th className="pb-2 font-black">{t("fantasy.colUser")}</th>
                      <th className="pb-2 font-black text-right">{t("fantasy.formationSelectorLabel")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredTeams.map((team, idx) => (
                      <tr key={idx} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-all">
                        <td className="py-2.5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 font-black text-white truncate max-w-[120px]">{team.teamName}</td>
                        <td className="py-2.5 font-extrabold text-emerald-400 truncate max-w-[100px]">{team.nickname}</td>
                        <td className="py-2.5 font-semibold text-right text-slate-300">{team.formation}</td>
                      </tr>
                    ))}
                    {registeredTeams.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-slate-500 font-semibold">{t("fantasy.noStandings")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: BUILDER SUMMARY / EXPLANATION */}
            {activeTab === "builder" && (
              <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                <p>
                  ⚽ <b>{t("fantasy.ruleFormation")}</b> {t("fantasy.ruleFormationDesc")}
                </p>
                <p>
                  🏆 <b>{t("fantasy.rulePoints")}</b> {t("fantasy.rulePointsDesc")}
                </p>
                <p>
                  🛠️ <b>{t("fantasy.ruleTransfer")}</b> {t("fantasy.ruleTransferDesc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selector Modal Drawer */}
      {selectorModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400" /> {(() => {
                  let posName = "";
                  if (selectorModal.positionFilter === "GK") posName = t("fantasy.goalkeeper");
                  else if (selectorModal.positionFilter === "DEF") posName = t("fantasy.defender");
                  else if (selectorModal.positionFilter === "MID") posName = t("fantasy.midfielder");
                  else if (selectorModal.positionFilter === "FWD") posName = t("fantasy.forward");
                  return t("fantasy.playerSelection").replace("{pos}", posName);
                })()}
              </h3>
              <button
                onClick={() => setSelectorModal({ isOpen: false, slotIndex: null, isBench: false, positionFilter: null })}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
              >
                ×
              </button>
            </div>

            {/* Search inputs */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/30">
              <input
                type="text"
                placeholder={t("fantasy.searchPlaceholder")}
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={playerSearchTeamFilter}
                onChange={(e) => setPlayerSearchTeamFilter(e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-xs px-4 py-2 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="">{t("fantasy.allTeams")}</option>
                {Object.values(OFFICIAL_GROUP_DRAW).flat().map((teamCode) => (
                  <option key={teamCode} value={teamCode}>{teamCode.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Players list */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {searchablePlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => selectPlayer(player.id)}
                  className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/40 hover:border-emerald-500/30 rounded-xl p-3.5 flex justify-between items-center transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">{player.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{player.club}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-bold text-slate-300">{player.teamNameTr} ({player.teamId.toUpperCase()})</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-emerald-400 font-extrabold capitalize">
                      {(() => {
                        const genPos = getGeneralPosition(player.position);
                        if (genPos === "GK") return t("fantasy.goalkeeper");
                        if (genPos === "DEF") return t("fantasy.defender");
                        if (genPos === "MID") return t("fantasy.midfielder");
                        return t("fantasy.forward");
                      })()}
                    </span>
                    <button className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-slate-950">
                      {t("fantasy.selectBtn")}
                    </button>
                  </div>
                </div>
              ))}
              {searchablePlayers.length === 0 && (
                <p className="text-center text-slate-500 py-10 font-semibold text-xs">{t("fantasy.noPlayersFound")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
