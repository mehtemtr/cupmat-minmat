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
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("statmatik_migration_notice_seen");
      if (!hasSeen) {
        setShowMigrationModal(true);
      }
    }
  }, []);
  
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
    const generalHubs = ["/teams", "/futbolcular", "/groups", "/venues", "/tahminler"];
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

  // Helper to check if pathname was claimed today
  const isClaimedToday = (path: string) => {
    try {
      const saved = localStorage.getItem("wc2026-claimed-pages");
      if (!saved) return false;
      const data = JSON.parse(saved) as Record<string, string[]>;
      const today = getTodayKey();
      return data[today]?.includes(path) || false;
    } catch {
      return false;
    }
  };

  // Helper to save claimed pathname
  const recordClaimToday = (path: string) => {
    try {
      const saved = localStorage.getItem("wc2026-claimed-pages") || "{}";
      const data = JSON.parse(saved) as Record<string, string[]>;
      const today = getTodayKey();
      if (!data[today]) data[today] = [];
      if (!data[today].includes(path)) {
        data[today].push(path);
      }
      localStorage.setItem("wc2026-claimed-pages", JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
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

    // Check if this page has already been claimed today
    if (isClaimedToday(pathname)) {
      // "Sayaç çıkmasın ya da geri sayıma başlamasın"
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
  }, [pathname, isSignedIn, user]);

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
          userId: user.id,
          displayName: user.fullName || user.username || "Kullanıcı",
          action: cleanPathAction,
          amount: points,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Record claim in today's log
        recordClaimToday(path);
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
      }
    } catch (error) {
      console.error("Error claiming page stay points:", error);
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

  // Dismiss handler
  const dismissMigrationModal = () => {
    localStorage.setItem("statmatik_migration_notice_seen", "true");
    setShowMigrationModal(false);
  };

  const renderMigrationModal = () => {
    if (!showMigrationModal) return null;
    const modalTitle = locale === "tr" ? "Puan Sistemi ve Güncelleme Hakkında" : "About Score System & Migration";
    const modalButton = locale === "tr" ? "Anladım ve Keşfet" : "Understand and Explore";

    return (
      <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#04080e] p-6 sm:p-8 shadow-2xl shadow-emerald-500/5 animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center gap-3.5 border-b border-white/10 pb-4 mb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25 text-2xl animate-bounce">
              📢
            </span>
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent tracking-wide">
              {modalTitle}
            </h2>
          </div>

          <div className="text-sm sm:text-base leading-relaxed text-zinc-300 space-y-4 font-medium">
            {locale === "tr" ? (
              <>
                <p className="font-semibold text-white">Değerli Statmatik Kullanıcıları,</p>
                <p>
                  Sizlere daha kesintisiz, hızlı ve küresel standartlarda bir deneyim sunabilmek adına Statmatik mobil uygulamamızı tamamladık ve yayına hazırladık.
                </p>
                <p>
                  Bu büyük altyapı geçişi kapsamında, daha önce cihazınızda yerel (lokal) olarak tutulan puanlama sistemimizi, tüm dünyayla entegre çalışacak şekilde küresel (bulut) sunucularımıza taşıdık.
                </p>
                <p className="border-l-2 border-amber-500/50 pl-4 py-1.5 bg-amber-500/5 rounded-r-xl text-amber-200 font-semibold">
                  Bu teknik zorunluluk ve veritabanı senkronizasyonu nedeniyle, eski yerel puanlar sıfırlanmak durumunda kalmıştır. Yaşanan bu durumdan dolayı tüm kullanıcılarımızdan özür dileriz.
                </p>
                <p>
                  Yeni küresel sistem sayesinde puanlarınız artık asla kaybolmayacak, tüm cihazlarınızda eşitlenecek ve çok yakında başlayacak olan küresel liderlik tablolarında yerinizi almanızı sağlayacaktır.
                </p>
                <p>
                  Anlayışınız ve desteğiniz için teşekkür eder, yeni uygulamamızda keyifli tahminler dileriz!
                </p>
                <p className="font-bold text-emerald-400 text-right mt-6">— Statmatik Ekibi</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-white">Dear Statmatik Users,</p>
                <p>
                  We have completed and prepared our Statmatik mobile application for release in order to provide you with a more seamless, fast, and global experience.
                </p>
                <p>
                  As part of this major infrastructure transition, we have moved our scoring system, which was previously kept locally on your device, to our global (cloud) servers to work integrated with the whole world.
                </p>
                <p className="border-l-2 border-amber-500/50 pl-4 py-1.5 bg-amber-500/5 rounded-r-xl text-amber-200 font-semibold">
                  Due to this technical necessity and database synchronization, old local points had to be reset. We apologize to all our users for this situation.
                </p>
                <p>
                  Thanks to the new global system, your points will never be lost, will be synchronized across all your devices, and will allow you to take your place in the global leaderboards that will start very soon.
                </p>
                <p>
                  Thank you for your understanding and support, and we wish you pleasant predictions in our new application!
                </p>
                <p className="font-bold text-emerald-400 text-right mt-6">— Statmatik Team</p>
              </>
            )}
          </div>

          <div className="flex justify-end border-t border-white/10 pt-5 mt-6">
            <button 
              onClick={dismissMigrationModal}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-3 text-sm sm:text-base font-bold text-[#060b14] shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02] active:scale-95"
            >
              🚀 {modalButton}
            </button>
          </div>

        </div>
      </div>
    );
  };

  if (!isSignedIn || !user) {
    return renderMigrationModal();
  }

  const activeConfig = getPageConfig(pathname);
  const totalDuration = activeConfig ? activeConfig.duration : 30;

  return (
    <>
      {renderMigrationModal()}
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
