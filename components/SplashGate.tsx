"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

const KICKOFF = new Date("2026-06-11T00:00:00").getTime();

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const diff = Math.max(0, KICKOFF - Date.now());
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
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

  // We keep children mounted so they are ready behind the splash screen.
  // We use fixed overlay for the splash.
  return (
    <>
      {!isDismissed && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#04080e] transition-transform duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] ${
            isDismissing ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#04080e] to-[#04080e]" />
          <div className="absolute top-1/4 h-[400px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
          
          <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
            {mounted && (
              <>
                <h1 className="mb-12 text-4xl font-extrabold uppercase tracking-widest text-white sm:text-6xl md:text-7xl">
                  <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    Fıfa World Cup
                  </span>
                  <br />
                  <span className="text-3xl sm:text-5xl md:text-6xl text-zinc-100 drop-shadow-lg">
                    2026
                  </span>
                </h1>

                <div className="mb-16 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
                  {units.map((u, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/5 shadow-[0_0_40px_rgba(52,211,153,0.15)] backdrop-blur-md sm:h-32 sm:w-32">
                        <span className="font-mono text-5xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)] sm:text-6xl">
                          {pad(u.value)}
                        </span>
                      </div>
                      <span className="mt-4 text-sm font-semibold tracking-widest text-emerald-400/80 uppercase">
                        {u.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStart}
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-emerald-500 px-10 py-5 font-bold text-[#04080e] shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all duration-300 hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_60px_rgba(52,211,153,0.6)]"
                >
                  <span className="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <Play className="h-6 w-6 fill-[#04080e] transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="text-lg tracking-wide uppercase">KUPAYI GÖR</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main page content container */}
      <div
        className={`transition-all duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)] ${
          isDismissing && !isDismissed
            ? "translate-y-0 opacity-100"
            : !isDismissing && !isDismissed
            ? "-translate-y-16 opacity-0 overflow-hidden h-screen"
            : "translate-y-0 opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
