"use client";

import React from "react";
import { LanguageCode, MinlanCommunityStats } from "@/lib/minlan/types";
import { getMinlanTranslation } from "@/lib/minlan/i18n";
import { Flame } from "lucide-react";

interface MinlanHeaderProps {
  nativeLang?: LanguageCode;
  communityStats: MinlanCommunityStats;
}

export function MinlanHeader({ nativeLang = "tr", communityStats }: MinlanHeaderProps) {
  const t = getMinlanTranslation(nativeLang);
  const currentMatches = communityStats.total_card_matches;
  const targetMatches = communityStats.target_card_matches;
  const progressPercent = Math.min(100, Math.floor((currentMatches / targetMatches) * 100));

  return (
    <div className="w-full pb-3 mb-2 border-b border-slate-800/80 flex flex-col items-center select-none">
      {/* Centered Brand Logo, Title & Multilingual Slogan */}
      <div className="flex flex-col items-center justify-center text-center mb-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center overflow-hidden p-1 shadow-lg shadow-cyan-500/20 mb-2">
          <img
            src="/minlan-logo.png"
            alt="MinLan Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-0.5">
          MinLan — Dil Avı
        </h1>
        <p className="text-xs text-slate-400 font-medium italic">
          {t.slogan}
        </p>
      </div>

      {/* Compact Live Community Match Progress Bar */}
      <div className="w-full space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="uppercase tracking-wider">{t.communityGoal}</span>
          </div>
          <div className="text-slate-300 font-mono font-bold text-[11px]">
            <span className="text-cyan-400">{currentMatches.toLocaleString("tr-TR")}</span> /{" "}
            {targetMatches.toLocaleString("tr-TR")} (%{progressPercent})
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
