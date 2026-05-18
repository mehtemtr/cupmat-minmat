"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation, useLocale } from "@/contexts/LocaleContext";
import { locales, type Locale } from "@/lib/i18n/types";
import { Trophy, Sparkles, ChevronRight, Calculator, Activity, Globe } from "lucide-react";

export default function EntryPage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();



  const toggleLocale = () => {
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    setLocale(locales[nextIndex]);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04080e] selection:bg-emerald-500/30">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      
      {/* Floating Language Toggle */}
      <div className="fixed right-6 top-6 z-50">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-[#060b14]/80 px-4 py-2 text-sm font-bold text-zinc-200 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
        >
          <Globe className="h-4 w-4 text-emerald-400" />
          <span className="uppercase">{locale}</span>
        </button>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-20">
        <header className="mb-16 w-full">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {t("hero.mainBadge")}
            </div>
          </div>
          
          <div className="relative flex overflow-x-hidden border-y border-white/5 bg-white/[0.02] py-6">
            <div className="animate-marquee flex whitespace-nowrap gap-12">
              {[1, 2, 3, 4].map((i) => (
                <h1 key={i} className="text-2xl font-black tracking-tight text-white uppercase sm:text-4xl">
                  {t("hero.slogan").split("statmatik.com")[0]}
                  <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    statmatik.com {t("hero.slogan").split("statmatik.com")[1]}
                  </span>
                </h1>
              ))}
            </div>
          </div>
        </header>

        {/* 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı Special Banner */}
        <div className="w-full mb-12 relative group rounded-3xl overflow-hidden border border-red-500/20 bg-gradient-to-r from-red-950/20 via-[#060b14]/80 to-zinc-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:border-red-500/30">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-red-600 to-amber-600 opacity-10 blur transition duration-500 group-hover:opacity-15" />
          <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            
            {/* Celebration Image */}
            <div className="w-full md:w-[42%] flex justify-center relative">
              <div className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[5/4] max-w-[380px] rounded-2xl overflow-hidden border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.25)] bg-zinc-900 group-hover:scale-[1.01] transition-transform duration-300">
                <img
                  src="/19_mayis_celebration.png"
                  alt="19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Celebration Message */}
            <div className="w-full md:w-[58%] text-center md:text-left flex flex-col justify-center">
              <span className="inline-flex self-center md:self-start items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-black text-red-400 tracking-wider uppercase mb-3.5 select-none animate-pulse">
                {"🇹🇷 19 MAYIS ÖZEL"}
              </span>
              
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-3">
                {locale === "tr" ? (
                  <>{`19 Mayıs Atatürk'ü Anma,`}<br />{`Gençlik ve Spor Bayramı Kutlu Olsun!`}</>
                ) : (
                  <>{`Commemoration of Atatürk,`}<br />{`Youth and Sports Day Happy May 19th!`}</>
                )}
              </h2>

              <p className="text-sm text-zinc-300 leading-relaxed mb-4 max-w-[580px]">
                {locale === "tr" ? (
                  "Gazi Mustafa Kemal Atatürk'ün Samsun'a çıkışıyla yaktığı bağımsızlık meşalesini bugün de aynı coşku ve inançla taşıyoruz. Atatürk'ün Türk gençliğine armağan ettiği bu kutlu bayram hepimize kutlu olsun!"
                ) : (
                  "We carry the independence torch lit by Gazi Mustafa Kemal Atatürk with his landing in Samsun, with the same enthusiasm and faith today. Happy May 19th to all of us!"
                )}
              </p>

              {/* Quote Block */}
              <div className="relative border-l-2 border-amber-500/60 pl-4 py-1.5 bg-amber-500/5 rounded-r-xl max-w-[580px] text-left">
                <p className="text-xs sm:text-sm font-medium italic text-amber-300 leading-snug">
                  {"\"Ey Türk gençliği! Birinci vazifen; Türk istiklalini, Türk cumhuriyetini, ilelebet muhafaza ve müdafaa etmektir. Muhtaç olduğun kudret, damarlarındaki asil kanda mevcuttur!\""}
                </p>
                <span className="block text-[10px] font-black tracking-widest text-amber-400 uppercase mt-2">
                  {"— MUSTAFA KEMAL ATATÜRK"}
                </span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="grid w-full gap-8 md:grid-cols-2">
          {/* CupMat Card */}
          <Link href="/cupmat" className="group relative">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#060b14] p-12 text-center transition-transform duration-300 group-hover:-translate-y-2">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                <Trophy className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-white uppercase">CupMat</h2>
              <p className="mb-10 max-w-[280px] text-lg leading-relaxed text-zinc-400">
                {t("hero.cupMatDesc")}
              </p>
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                {t("hero.playStart")} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* MinMat Card */}
          <Link href="/minmat/index.html" className="group relative">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#060b14] p-12 text-center transition-transform duration-300 group-hover:-translate-y-2">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-500/10 ring-1 ring-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden p-4">
                <Image 
                  src="/minmat/icon.png" 
                  alt="MinMat Icon" 
                  width={64} 
                  height={64} 
                  className="object-contain"
                />
              </div>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-white uppercase">MinMat</h2>
              <p className="mb-10 max-w-[280px] text-lg leading-relaxed text-zinc-400">
                {t("hero.minMatDesc")}
              </p>
              <div className="flex items-center gap-2 font-bold text-blue-400">
                {t("hero.mindRefresh")} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        <footer className="mt-20 flex items-center gap-8 text-zinc-500">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>AI powered</span>
          </div>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>Math logic</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
