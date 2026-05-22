"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { useTranslation } from "@/contexts/LocaleContext";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden pt-16"
    >
      <div className="pitch-pattern absolute inset-0 opacity-40" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#060b14] via-[#060b14]/90 to-[#0a1220]"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-1/4 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-amber-500/5 blur-[80px]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
          <Sparkles className="h-4 w-4" />
          {t("hero.badge")}
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          {t("hero.title")}{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
            {t("hero.titleHighlight")}
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
          {t("hero.subtitle")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-[#060b14] shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-emerald-500"
          >
            {t("hero.ctaPrimary")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/tahminler"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
          >
            <Play className="h-4 w-4 text-emerald-400" />
            {t("hero.ctaSecondary")}
          </Link>
        </div>

        <div className="mt-16 w-full max-w-3xl">
          <Countdown />
        </div>
      </div>

      <div
        className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a1220] to-transparent"
        aria-hidden
      />
    </section>
  );
}
