"use client";

import React from "react";
import { getMinmatTranslation } from "@/lib/minmat/i18n";
import { Calculator } from "lucide-react";

interface MinmatHeaderProps {
  lang?: string;
}

export function MinmatHeader({ lang = "tr" }: MinmatHeaderProps) {
  const t = getMinmatTranslation(lang);

  return (
    <div className="w-full pb-3 mb-3 border-b border-slate-800/80 flex flex-col items-center select-none">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center overflow-hidden p-1 shadow-lg shadow-emerald-500/20 mb-2">
          <Calculator className="w-7 h-7 text-emerald-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-0.5">
          {t.title}
        </h1>
        <p className="text-xs text-slate-400 font-medium italic">
          {t.slogan}
        </p>
      </div>
    </div>
  );
}
