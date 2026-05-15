"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

const KICKOFF = new Date("2026-06-11T00:00:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calcTimeLeft(): TimeLeft {
  const diff = Math.max(0, KICKOFF - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown() {
  const { t } = useTranslation();
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time.days, label: t("countdown.days") },
    { value: time.hours, label: t("countdown.hours") },
    { value: time.minutes, label: t("countdown.minutes") },
    { value: time.seconds, label: t("countdown.seconds") },
  ] as const;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-center gap-2 text-sm text-zinc-400">
        <Calendar className="h-4 w-4 text-emerald-400" />
        <span>{t("countdown.label")}</span>
        <span className="text-emerald-400">·</span>
        <span className="font-medium text-zinc-300">
          {t("countdown.targetDate")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {units.map(({ value, label }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 to-transparent opacity-0 transition group-hover:opacity-100" />
            <p className="relative text-center font-mono text-3xl font-bold tabular-nums tracking-tight text-white sm:text-4xl">
              {mounted ? pad(value) : "--"}
            </p>
            <p className="relative mt-1 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
