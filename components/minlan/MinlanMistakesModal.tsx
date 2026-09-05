"use client";

import React, { useState, useEffect } from "react";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/minlan/types";
import { getMinlanTranslation } from "@/lib/minlan/i18n";
import { X, BrainCircuit, AlertCircle, RefreshCw } from "lucide-react";

interface MinlanMistakesModalProps {
  isOpen: boolean;
  onClose: () => void;
  nativeLang: LanguageCode;
  targetLang: LanguageCode;
}

export function MinlanMistakesModal({
  isOpen,
  onClose,
  nativeLang,
  targetLang,
}: MinlanMistakesModalProps) {
  const t = getMinlanTranslation(nativeLang);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<"3days" | "all">("3days");

  useEffect(() => {
    if (!isOpen) return;

    async function fetchMistakes() {
      setLoading(true);
      try {
        const timestamp = Date.now();
        const res = await fetch(
          `/api/minlan/mistakes?native=${nativeLang}&target=${targetLang}&timeframe=${timeframe}&t=${timestamp}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success && data.mistakes) {
          setMistakes(data.mistakes);
        }
      } catch (err) {
        console.error("Failed to fetch mistakes", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMistakes();
  }, [isOpen, nativeLang, targetLang, timeframe]);

  if (!isOpen) return null;

  const nativeObj = SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang);
  const targetObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{t.mistakesModalTitle}</h3>
              <p className="text-xs text-slate-400">{t.mistakesModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-3 flex-1 flex flex-col">
          <div className="text-center text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
            {nativeObj?.flag} {nativeObj?.name} → {targetObj?.flag} {targetObj?.name}
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl w-full max-w-xs mx-auto mb-3">
            <button
              onClick={() => setTimeframe("3days")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === "3days" ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {t.mistakesTab3Days}
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === "all" ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {t.mistakesTabAll}
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-500/50" />
              <span>{t.cardsLoadingText}</span>
            </div>
          ) : mistakes.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 border border-emerald-500/20">
                <span className="text-2xl">🎉</span>
              </div>
              <span className="font-bold text-emerald-400">{t.mistakesEmptyTitle}</span>
              <span className="text-sm">
                {timeframe === "3days" 
                  ? t.mistakesEmpty3Days 
                  : t.mistakesEmptyAll}
              </span>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-1 scrollbar-none">
              {mistakes.map((m, idx) => (
                <div
                  key={m.word_id || idx}
                  className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{m.native_word}</span>
                    <span className="text-xs text-purple-300 font-mono">{m.target_word}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-black text-red-400">
                      {t.mistakesCountBadge.replace("{count}", String(m.count))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
