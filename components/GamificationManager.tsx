"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useLocale } from "@/contexts/LocaleContext";

interface ToastMessage {
  id: string;
  text: string;
  icon: string;
}

// 5-language support dictionary for the floating Discovery Timer
const localDict = {
  tr: {
    timerTitle: "Keşif Sayacı",
    counting: "Keşfediliyor...",
    discovered: "✓ Keşfedildi!",
    pointsEarned: "Keşif Puanı Kazandın!"
  },
  en: {
    timerTitle: "Discovery Timer",
    counting: "Discovering...",
    discovered: "✓ Discovered!",
    pointsEarned: "Discovery Points Earned!"
  },
  es: {
    timerTitle: "Temporizador de Descubrimiento",
    counting: "Descubriendo...",
    discovered: "✓ ¡Descubierto!",
    pointsEarned: "puntos de descubrimiento!"
  },
  fr: {
    timerTitle: "Compteur de Découverte",
    counting: "Découverte...",
    discovered: "✓ Découvert !",
    pointsEarned: "points de découverte gagnés !"
  },
  de: {
    timerTitle: "Entdeckungs-Timer",
    counting: "Entdecken...",
    discovered: "✓ Entdeckt!",
    pointsEarned: "Entdeckungspunkte erhalten!"
  }
};

export function GamificationManager() {
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const { locale } = useLocale();

  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Page stay timer states
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isRewarded, setIsRewarded] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPathRef = useRef(pathname);
  const hasClaimedRef = useRef(false);

  // 1. Determine page category and rules
  const getPageConfig = (path: string) => {
    // Exclude landing page, leaderboard, authentication paths, and MinMat/MinLan entry/game pages
    if (
      path === "/" ||
      path === "/leaderboard" ||
      path === "/minmat" ||
      path.startsWith("/minmat/") ||
      path === "/minlan" ||
      path.startsWith("/minlan/") ||
      path === "/auth-redirect" ||
      path === "/auth-signout" ||
      path.startsWith("/sign-in") ||
      path.startsWith("/sign-up")
    ) {
      return null;
    }

    // Active pages (30 seconds, +10 points)
    return { duration: 30, points: 10, category: "hub" };
  };

  // Date helper (YYYY-MM-DD local timezone)
  const getTodayKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to check if page-stay is restricted (cooldown or limit)
  const getPageStayRestriction = (path: string, duration: number) => {
    try {
      const saved = localStorage.getItem("wc2026-gamification-state");
      if (!saved) return { restricted: false };
      
      const data = JSON.parse(saved);
      const today = getTodayKey();
      
      if (data.lastSyncDate === today && data.pageStayHistory) {
        const cleanPathAction = `stay_${duration}s_${path.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const pageRecord = data.pageStayHistory[cleanPathAction];
        
        if (pageRecord) {
          // Check limit (max 5 claims per page per day)
          if ((pageRecord.claimsTodayCount || 0) >= 5) {
            return { restricted: true, reason: "limit" };
          }
          
          // Check 2-hour cooldown for this specific page
          if (pageRecord.lastClaimedAt) {
            const lastClaimTime = new Date(pageRecord.lastClaimedAt).getTime();
            const now = Date.now();
            const elapsedMs = now - lastClaimTime;
            const cooldownMs = 2 * 60 * 60 * 1000; // 2 hours
            if (elapsedMs < cooldownMs) {
              return { restricted: true, reason: "cooldown", remainingMs: cooldownMs - elapsedMs };
            }
          }
        }
      }
    } catch (e) {
      console.error("Error reading restriction from localStorage", e);
    }
    return { restricted: false };
  };

  // Handle page transitions & timer setups
  useEffect(() => {
    currentPathRef.current = pathname;
    hasClaimedRef.current = false; // Reset page stay claim lock on navigation!
    
    // Clear any active interval on route change
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset UI states
    setSecondsLeft(null);
    setIsRewarded(false);
    setShowWidget(false);

    if (!isSignedIn || !user) return;

    // Check if this page is eligible
    const config = getPageConfig(pathname);
    if (!config) return;

    // 1. First check local restriction
    const localRestriction = getPageStayRestriction(pathname, config.duration);
    if (localRestriction.restricted) {
      return;
    }

    let isMounted = true;

    // 2. Fetch fresh profile from server to guarantee refresh doesn't show timer if cooldown/claimed
    const verifyAndStartTimer = async () => {
      try {
        const res = await fetch(`/api/gamification?userId=${encodeURIComponent(user.id)}&light=true`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.profile?.pageStayHistory && typeof window !== "undefined") {
            localStorage.setItem(
              "wc2026-gamification-state",
              JSON.stringify({
                pageStayHistory: data.profile.pageStayHistory,
                lastSyncDate: new Date().toISOString().split("T")[0],
              })
            );

            // Re-check restriction with updated server data
            const freshRestriction = getPageStayRestriction(pathname, config.duration);
            if (freshRestriction.restricted || !isMounted) {
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync server gamification restriction:", err);
      }

      if (!isMounted) return;

      // Setup active timer
      setSecondsLeft(config.duration);
      setIsRewarded(false);
      setShowWidget(true);

      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            claimPoints(pathname, config.points, config.duration);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    verifyAndStartTimer();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [pathname, isSignedIn, user?.id]);

  const claimPoints = async (path: string, points: number, duration: number) => {
    if (!user || hasClaimedRef.current) return;
    hasClaimedRef.current = true; // Lock immediately to prevent React double execution!

    try {
      // Create a unique clean action key for the backend DB gamification log
      const cleanPathAction = `stay_${duration}s_${path.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const res = await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: cleanPathAction,
          amount: points,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update gamification state in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "wc2026-gamification-state",
            JSON.stringify({
              pageStayHistory: data.profile.pageStayHistory || {},
              lastSyncDate: new Date().toISOString().split("T")[0],
            })
          );
        }

        setIsRewarded(true);

        // Notify global headers to update taraftarPuani immediately
        window.dispatchEvent(
          new CustomEvent("taraftar-puan-guncellendi", {
            detail: { points: data.profile.taraftarPuani },
          })
        );

        // Show floating toast
        setToast({
          id: `toast-${Date.now()}`,
          text: `+${points} ${dict.pointsEarned}`,
          icon: points === 10 ? "🌟" : "⚡",
        });

        // Hide floating timer card after 3 seconds
        setTimeout(() => {
          if (currentPathRef.current === path) {
            setShowWidget(false);
          }
        }, 3000);
      } else {
        // If server rejected the claim (e.g. cooldown or limit), update localStorage with returned profile if available
        if (data.profile && typeof window !== "undefined") {
          localStorage.setItem(
            "wc2026-gamification-state",
            JSON.stringify({
              pageStayHistory: data.profile.pageStayHistory || {},
              lastSyncDate: new Date().toISOString().split("T")[0],
            })
          );
        }

        // Show error message returned by server
        setToast({
          id: `toast-${Date.now()}`,
          text: data.error || "Puan kazanılamadı.",
          icon: "⚠️",
        });

        setTimeout(() => {
          if (currentPathRef.current === path) {
            setShowWidget(false);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Error claiming page stay points:", error);
      hasClaimedRef.current = false;
    }
  };

  // Toast auto-clear
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Global custom event toast listener (like for about modals or easter eggs)
  useEffect(() => {
    const handleGlobalEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.toast) {
        setToast({
          id: `toast-${Date.now()}`,
          text: customEvent.detail.toast,
          icon: "🎁",
        });
      }
    };

    window.addEventListener("taraftar-puan-guncellendi", handleGlobalEvent);
    return () => window.removeEventListener("taraftar-puan-guncellendi", handleGlobalEvent);
  }, []);

  if (!isSignedIn || !user) {
    return null;
  }

  const activeConfig = getPageConfig(pathname);
  const totalDuration = activeConfig ? activeConfig.duration : 30;

  return (
    <>
      {/* Toast message popup */}
      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-24 sm:bottom-32 left-1/2 z-[99999] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#060b14]/95 px-5 py-3 sm:px-6 sm:py-4 text-emerald-400 shadow-2xl shadow-emerald-500/30 backdrop-blur-xl animate-float-up-smooth max-w-[90vw]"
        >
          <span className="text-xl sm:text-2xl animate-bounce">{toast.icon}</span>
          <span className="text-xs sm:text-base font-black tracking-wide bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent truncate">
            {toast.text}
          </span>
        </div>
      )}

      {/* Floating Keşif Sayacı (Discovery Timer) Widget - Compact & In Bottom-Right / Right Corner */}
      {showWidget && secondsLeft !== null && (
        <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-[9999] rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#060b14]/90 p-2 sm:p-3 backdrop-blur-xl shadow-xl flex items-center gap-2 sm:gap-3 select-none animate-fadeIn border-t-emerald-500/30 hover:scale-105 transition-transform">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                strokeWidth="3.5"
                stroke="currentColor"
                className="text-zinc-900"
                fill="transparent"
              />
              {!isRewarded && (
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  strokeWidth="3.5"
                  strokeDasharray="113"
                  strokeDashoffset={113 - (113 * (totalDuration - secondsLeft)) / totalDuration}
                  strokeLinecap="round"
                  stroke="currentColor"
                  className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] transition-all duration-1000"
                  fill="transparent"
                />
              )}
            </svg>
            <div className="absolute flex flex-col items-center">
              {isRewarded ? (
                <span className="text-sm sm:text-base animate-bounce">🌟</span>
              ) : (
                <span className="text-[11px] sm:text-xs font-black text-white font-mono">
                  {secondsLeft}s
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col text-left pr-1 sm:pr-2">
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
              {dict.timerTitle}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-emerald-400">
              {isRewarded ? dict.discovered : dict.counting}
            </span>
          </div>
        </div>
      )}

      {/* Premium Cinematic Floating Points Animation Easing */}
      <style>{`
        @keyframes floatUpSmooth {
          0% {
            transform: translate(-50%, 60px);
            opacity: 0;
            filter: blur(4px);
            scale: 0.9;
          }
          12% {
            transform: translate(-50%, 0);
            opacity: 1;
            filter: blur(0);
            scale: 1.05;
          }
          18% {
            transform: translate(-50%, -5px);
            opacity: 1;
            filter: blur(0);
            scale: 1;
          }
          85% {
            transform: translate(-50%, -150px);
            opacity: 1;
            filter: blur(0);
            scale: 1;
          }
          100% {
            transform: translate(-50%, -220px);
            opacity: 0;
            filter: blur(4px);
            scale: 0.95;
          }
        }
        .animate-float-up-smooth {
          animation: floatUpSmooth 3.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
