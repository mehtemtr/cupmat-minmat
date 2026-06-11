"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

const KICKOFF = new Date("2026-06-11T22:00:00+03:00").getTime();

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkTime = () => {
      const now = Date.now();
      if (now >= KICKOFF) {
        setIsDismissed(true);
        return true;
      }
      const diff = KICKOFF - now;
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
      return false;
    };

    const finished = checkTime();
    if (finished) return;

    const id = setInterval(() => {
      if (checkTime()) {
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleStart = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsDismissed(true);
      window.scrollTo(0, 0);
    }, 1000); // 1s animation
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { value: time.days, label: t("countdown.days") || "GÜN" },
    { value: time.hours, label: t("countdown.hours") || "SAAT" },
    { value: time.minutes, label: t("countdown.minutes") || "DAKİKA" },
    { value: time.seconds, label: t("countdown.seconds") || "SANİYE" },
  ];

  // SSR Safe: Once mounted and dismissed, destroy the overlay completely
  if (mounted && isDismissed) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-start overflow-y-auto bg-[#04080e] py-8 landscape:py-4 transition-transform duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] ${
          isDismissing ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#04080e] to-[#04080e]" />
        <div className="absolute top-1/4 h-[400px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
        
        <div className="relative z-10 flex flex-col items-center justify-center px-4 my-auto text-center w-full max-w-4xl">
          <h1 className="mb-12 landscape:mb-4 text-4xl landscape:text-2xl font-extrabold uppercase tracking-widest text-white sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              {t("hero.badge")}
            </span>
            <br />
            <span className="text-3xl landscape:text-xl sm:text-5xl md:text-6xl text-zinc-100 drop-shadow-lg">
              2026
            </span>
          </h1>

          <div className="mb-16 landscape:mb-6 grid grid-cols-2 landscape:grid-cols-4 gap-6 landscape:gap-4 sm:grid-cols-4 sm:gap-8">
            {units.map((u, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex h-24 w-24 landscape:h-16 landscape:w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/5 shadow-[0_0_40px_rgba(52,211,153,0.15)] backdrop-blur-md sm:h-32 sm:w-32">
                  <span className="font-mono text-5xl landscape:text-2xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)] sm:text-6xl">
                    {mounted ? pad(u.value) : "00"}
                  </span>
                </div>
                <span className="mt-4 landscape:mt-1 text-sm landscape:text-[10px] font-semibold tracking-widest text-emerald-400/80 uppercase">
                  {u.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-emerald-500 px-10 py-5 landscape:px-6 landscape:py-3 font-bold text-[#04080e] shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all duration-300 hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_60px_rgba(52,211,153,0.6)]"
          >
            <span className="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Play className="h-6 w-6 landscape:h-4 landscape:w-4 fill-[#04080e] transition-transform duration-300 group-hover:translate-x-1" />
            <span className="text-lg landscape:text-sm tracking-wide uppercase">{t("hero.playStart")}</span>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] ${
          isDismissing ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
