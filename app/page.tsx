"use client";

import Link from "next/link";
import Image from "next/image";
import { Trophy, Sparkles, ChevronRight, Calculator, Activity } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

export default function EntryPage() {
  const { t } = useTranslation();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04080e] selection:bg-emerald-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-20">
        <header className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
            <Sparkles className="h-4 w-4" />
            CupMat & MinMat Ecosystem
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white sm:text-6xl md:text-7xl">
            Seçiminizi <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Yapın</span>
          </h1>
        </header>

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
                Yapay zeka destekli, dünya kupasıyla ilgili her şey!
              </p>
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                Oynamaya Başla <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
                Sizin ve çocuklarınızın hafızadan hesap yapmasını kolaylaştıracak zeka oyunu!
              </p>
              <div className="flex items-center gap-2 font-bold text-blue-400">
                Zihnini Canlandır <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
