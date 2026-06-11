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
    // General pages (30 seconds, +10 points)
    const generalHubs = ["/teams", "/futbolcular", "/groups", "/venues", "/tahminler", "/stats"];
    if (generalHubs.includes(path)) {
      return { duration: 30, points: 10, category: "hub" };
    }

    // Underlying detail pages (10 seconds, +1 point)
    const isDetail =
      (path.startsWith("/futbolcular/") && path !== "/futbolcular") ||
      (path.startsWith("/ulkeler/") && path !== "/ulkeler") ||
      (path.startsWith("/stadyumlar/") && path !== "/stadyumlar") ||
      (path.startsWith("/hakemler/") && path !== "/hakemler");

    if (isDetail) {
      return { duration: 10, points: 1, category: "detail" };
    }

    return null;
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

    // Check if page stay is restricted globally (limit reached, claimed, or in cooldown)
    const restriction = getPageStayRestriction(pathname, config.duration);
    if (restriction.restricted) {
      // Don't show the timer or start countdown if user is in cooldown, has reached daily limit, or already claimed
      return;
    }

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

    return () => {
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

        // Hide floating timer card after 4 seconds
        setTimeout(() => {
          if (currentPathRef.current === path) {
            setShowWidget(false);
          }
        }, 4000);
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
        }, 4000);
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
          className="fixed bottom-32 left-1/2 z-[99999] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#060b14]/95 px-6 py-4 text-emerald-400 shadow-2xl shadow-emerald-500/30 backdrop-blur-xl animate-float-up-smooth"
        >
          <span className="text-2xl animate-bounce">{toast.icon}</span>
          <span className="text-sm sm:text-base font-black tracking-wide bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
            {toast.text}
          </span>
        </div>
      )}

      {/* Floating Keşif Sayacı (Discovery Timer) Widget */}
      {showWidget && secondsLeft !== null && (
        <div className="fixed bottom-6 right-6 z-[9999] rounded-3xl border border-zinc-800 bg-[#060b14]/90 p-4 backdrop-blur-xl shadow-2xl flex flex-col justify-center items-center text-center w-36 select-none animate-fadeIn border-t-emerald-500/20">
          <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block mb-2.5">
            ⏱️ {dict.timerTitle}
          </span>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                strokeWidth="4.5"
                stroke="currentColor"
                className="text-zinc-900"
                fill="transparent"
              />
              {!isRewarded && (
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="4.5"
                  strokeDasharray="214"
                  strokeDashoffset={214 - (214 * (totalDuration - secondsLeft)) / totalDuration}
                  strokeLinecap="round"
                  stroke="currentColor"
                  className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] transition-all duration-1000"
                  fill="transparent"
                />
              )}
            </svg>
            <div className="absolute flex flex-col items-center">
              {isRewarded ? (
                <>
                  <span className="text-xl">🌟</span>
                  <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider mt-0.5 animate-pulse">
                    {dict.discovered}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-black text-white">
                    {secondsLeft}s
                  </span>
                  <span className="text-[7px] text-zinc-500 uppercase tracking-widest mt-0.5">
                    {dict.counting}
                  </span>
                </>
              )}
            </div>
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
